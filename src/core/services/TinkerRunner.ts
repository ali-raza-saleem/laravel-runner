import * as vscode from "vscode";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";
import { WebviewManager } from "./WebviewManager";
import { Config } from "../utils/Config";
import { PathUtils } from "../utils/PathUtils";
import { eventBus } from "./EventBus";

export class TinkerRunner {
  private currentProcess: ChildProcess | null = null;
  private extensionUri: vscode.Uri;
  private webviewManager: WebviewManager;
  private config: Config;
  private pathUtils: PathUtils;
  private tinkerScriptPath: string;
  private registeredStopExecutionListener: boolean = false;
  private stopListenerFor: vscode.Webview | null = null;

  constructor(
    context: vscode.ExtensionContext,
    webviewManager: WebviewManager,
  ) {
    this.extensionUri = context.extensionUri;
    this.webviewManager = webviewManager;

    Config.init(context);
    this.config = Config.getInstance();

    PathUtils.init(this.config); // Initialize PathUtils singleton
    this.pathUtils = PathUtils.getInstance();

    this.tinkerScriptPath = this.config.get("customConfig.tinkerScriptPath");
  }

  /**
   * Runs the given PHP file using the Tinker script and captures all output.
   * @param fileUri The URI of the PHP file to run.
   */
  public runPhpFile(): void {
    if (this.currentProcess) {
      vscode.window.showWarningMessage(
        "Code is running. Please wait.. If you want to run another code, please stop the current run by pressing Stop button",
      );
      return;
    }

    const phpFileUri = this.getPhpFileUri();
    const workspaceRoot = this.pathUtils.getWorkspaceRoot(phpFileUri);

    if (!this.canRunPhpFile(workspaceRoot, phpFileUri)) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.document.save();
    } else {
      vscode.window.showInformationMessage("No active editor found.");
    }

    const phpFileRelativePath = path
      .relative(workspaceRoot, phpFileUri.fsPath)
      .replace(/\\/g, "/");
    const tinkerScriptAbsolutePath = path.join(
      this.extensionUri.fsPath,
      this.tinkerScriptPath,
    );

    this.currentProcess = this.evalScript(
      "php",
      [tinkerScriptAbsolutePath, phpFileRelativePath, workspaceRoot],
      workspaceRoot,
    );

    eventBus.setRunning(true);
  }

  /**
   * Retrieves the currently active PHP file URI if available.
   * @returns The URI of the active PHP file, or null if none is found.
   */
  private getPhpFileUri(): vscode.Uri | null {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === "php") {
      return activeEditor.document.uri;
    }

    vscode.window.showErrorMessage("No PHP file selected to run.");
    return null;
  }

  private canRunPhpFile(
    workspaceRoot: string,
    phpFileUri?: vscode.Uri,
  ): boolean {
    if (!phpFileUri) {
      vscode.window.showErrorMessage("No php file found.");
      return false;
    }

    if (!workspaceRoot) {
      vscode.window.showErrorMessage("No workspace found.");
      return false;
    }

    if (
      !this.pathUtils.fileIsInsideTinkerPlayground(workspaceRoot, phpFileUri)
    ) {
      vscode.window.showErrorMessage(
        "This command can only be run on PHP files inside a Laravel project.",
      );
      return false;
    }

    return true;
  }

  /**
   * Executes a shell command and captures output.
   * @param command The command to run.
   * @param args Arguments for the command.
   * @param cwd The working directory for the command.
   */
  private evalScript(
    command: string,
    args: string[],
    cwd: string,
  ): ChildProcess {
    this.webviewManager.sendScriptStartedMessage();
    // IMPORTANT: Must be registered after the WebView is created (only first time)
    // since it is attached on outputPanel webview, latter is null before

    this.registerStopExecutionListener();

    const process = spawn(command, args, { cwd });

    let output = "";
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.on("close", (code) => {
      this.currentProcess = null;
      eventBus.setRunning(false);

      if (code !== 0) {
        this.webviewManager.updateWebView(
          output || `Process exited with code ${code}`,
          true,
          false,
        );
      } else {
        this.webviewManager.updateWebView(output || "null", false, false);
      }
    });

    process.on("error", (err) => {
      this.webviewManager.updateWebView(
        output || `Error running script: ${err.message}`,
        true,
        false,
      );
      this.currentProcess = null;
      eventBus.setRunning(false);
      vscode.window.showErrorMessage(`Error running script: ${err.message}`);
    });

    return process;
  }

  public registerStopExecutionListener() {
    /* always ensure a panel exists */
    if (!this.webviewManager.outputPanel) {
      this.webviewManager.createOutputPanel();
    }

    const panel = this.webviewManager.outputPanel!;
    const webview = panel.webview;

    /* same webview already wired → nothing to do */
    if (this.stopListenerFor === webview) return;

    /* new / different webview → attach listener */
    webview.onDidReceiveMessage((message) => {
      if (message.command === "stopExecution") {
        this.stopExecution();
      }
    });

    /* when the panel is disposed, forget the reference so we re-wire next time */
    panel.onDidDispose(() => {
      if (this.stopListenerFor === webview) {
        this.stopListenerFor = null;
      }
    });

    this.stopListenerFor = webview;
  }

  /**
   * Stops the currently running PHP process.
   */
  public stopExecution(): void {
    this.currentProcess.kill("SIGTERM"); // ✅ Terminate the process gracefully
    this.currentProcess = null;
    

    // ✅ Update WebView to hide loader & stop button
    this.webviewManager.sendScriptKilledMessage();
  }

  public getConfig() {
    return this.config;
  }

  public getPathUtils() {
    return this.pathUtils;
  }
}
