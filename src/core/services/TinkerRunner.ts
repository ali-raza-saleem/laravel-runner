import * as vscode from "vscode";
import * as path from "path";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { PhpExecutableResolver } from "../utils/PhpExecutableResolver";
import { WebviewManager } from "./WebviewManager";
import { Config } from "../utils/Config";
import { PathUtils } from "../utils/PathUtils";
import { eventBus } from "./EventBus";

export class TinkerRunner {
  private currentProcess: ChildProcessWithoutNullStreams | null = null;
  private extensionUri: vscode.Uri;
  private webviewManager: WebviewManager;
  private config: Config;
  private pathUtils: PathUtils;
  private tinkerScriptPath: string;
  private stopListenerFor: vscode.Webview | null = null;
  private output: vscode.OutputChannel;

  constructor(
    context: vscode.ExtensionContext,
    webviewManager: WebviewManager,
    output: vscode.OutputChannel,
  ) {
    this.extensionUri = context.extensionUri;
    this.webviewManager = webviewManager;
    this.output = output;

    Config.init(context);
    this.config = Config.getInstance();

    PathUtils.init(this.config);
    this.pathUtils = PathUtils.getInstance();

    this.tinkerScriptPath = this.config.get("customConfig.tinkerScriptPath");
  }

  public runPhpFile(): void {
    if (this.currentProcess) {
      vscode.window.showWarningMessage(
        "Code is running. Please wait. If you want to run another code, stop the current run first.",
      );
      return;
    }

    const phpFileUri = this.getPhpFileUri();

    if (!phpFileUri) {
      return;
    }

    const workspaceRoot = this.pathUtils.getWorkspaceRoot(phpFileUri);

    if (!this.canRunPhpFile(workspaceRoot, phpFileUri)) {
      return;
    }

    const editor = vscode.window.activeTextEditor;

    if (editor) {
      void editor.document.save();
    }

    const phpFileRelativePath = path
      .relative(workspaceRoot!, phpFileUri.fsPath)
      .replace(/\\/g, "/");

    const tinkerScriptAbsolutePath = path.join(
      this.extensionUri.fsPath,
      this.tinkerScriptPath,
    );

    const php = PhpExecutableResolver.resolve();

    this.output.appendLine(`Using PHP: ${php.command} (${php.source})`);
    this.output.appendLine(`Workspace root: ${workspaceRoot}`);
    this.output.appendLine(`Tinker script: ${tinkerScriptAbsolutePath}`);
    this.output.appendLine(`PHP file: ${phpFileRelativePath}`);

    this.currentProcess = this.evalScript(
      php.command,
      [tinkerScriptAbsolutePath, phpFileRelativePath, workspaceRoot!],
      workspaceRoot!,
      php.isWindowsBatchFile,
    );

    eventBus.setRunning(true);
  }

  private getPhpFileUri(): vscode.Uri | null {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor && activeEditor.document.languageId === "php") {
      return activeEditor.document.uri;
    }

    vscode.window.showErrorMessage("No PHP file selected to run.");
    return null;
  }

  private canRunPhpFile(
    workspaceRoot: string | null,
    phpFileUri: vscode.Uri | null,
  ): boolean {
    if (!phpFileUri) {
      vscode.window.showErrorMessage("No PHP file found.");
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
        "This command can only be run on PHP files inside the Laravel Runner playground.",
      );
      return false;
    }

    return true;
  }

  private evalScript(
    command: string,
    args: string[],
    cwd: string,
    isWindowsBatchFile = false,
  ): ChildProcessWithoutNullStreams {
    this.webviewManager.sendScriptStartedMessage();
    this.registerStopExecutionListener();

    const child =
      process.platform === "win32" && isWindowsBatchFile
        ? spawn(command, args, {
            cwd,
            shell: true,
            windowsHide: true,
            env: process.env,
          })
        : spawn(command, args, {
            cwd,
            windowsHide: true,
            env: process.env,
          });

    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", (code) => {
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

    child.on("error", (error) => {
      this.webviewManager.updateWebView(
        output || `Error running script: ${error.message}`,
        true,
        false,
      );

      this.currentProcess = null;
      eventBus.setRunning(false);

      this.output.appendLine("PHP process failed:");
      this.output.appendLine(error.stack ?? error.message);

      vscode.window.showErrorMessage(`Error running script: ${error.message}`);
    });

    return child;
  }

  public registerStopExecutionListener(): void {
    if (!this.webviewManager.outputPanel) {
      this.webviewManager.createOutputPanel();
    }

    const panel = this.webviewManager.outputPanel!;
    const webview = panel.webview;

    if (this.stopListenerFor === webview) {
      return;
    }

    webview.onDidReceiveMessage((message) => {
      if (message.command === "stopExecution") {
        this.stopExecution();
      }
    });

    panel.onDidDispose(() => {
      if (this.stopListenerFor === webview) {
        this.stopListenerFor = null;
      }
    });

    this.stopListenerFor = webview;
  }

  public stopExecution(): void {
    if (!this.currentProcess) {
      return;
    }

    this.currentProcess.kill("SIGTERM");
    this.currentProcess = null;
    eventBus.setRunning(false);

    this.webviewManager.sendScriptKilledMessage();
  }

  public getConfig(): Config {
    return this.config;
  }

  public getPathUtils(): PathUtils {
    return this.pathUtils;
  }
}