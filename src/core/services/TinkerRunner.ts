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
  private stopListenerFor: vscode.Webview | null = null;
  private killedProcesses = new WeakSet<ChildProcess>();

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

    this.tinkerScriptPath =
      this.config.get<string>("customConfig.tinkerScriptPath") ??
      "./resources/tinker.php";
  }

  /**
   * Runs the given PHP file using the Tinker script and captures all output.
   * @param fileUri The URI of the PHP file to run.
   */
  public async runPhpFile(fileUri?: vscode.Uri): Promise<void> {
    try {
      if (this.currentProcess) {
        vscode.window.showWarningMessage(
          "Code is running. Please stop the current run before starting another.",
        );
        return;
      }

      const phpFileUri = fileUri ?? this.getPhpFileUri();

      if (!phpFileUri) {
        vscode.window.showErrorMessage("No PHP file selected to run.");
        return;
      }

      const workspaceRoot = this.pathUtils.getWorkspaceRoot(phpFileUri);

      if (!this.canRunPhpFile(workspaceRoot, phpFileUri)) {
        return;
      }

      const document = await vscode.workspace.openTextDocument(phpFileUri);
      await document.save();

      const phpFileRelativePath = path
        .relative(workspaceRoot!, phpFileUri.fsPath)
        .replace(/\\/g, "/");

      const tinkerScriptAbsolutePath = path.join(
        this.extensionUri.fsPath,
        this.tinkerScriptPath,
      );

      const phpPath = this.config.get<string>("phpPath") ?? "php";

      this.currentProcess = this.evalScript(
        phpPath,
        [tinkerScriptAbsolutePath, phpFileRelativePath, workspaceRoot!],
        workspaceRoot!,
      );

      eventBus.setRunning(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      vscode.window.showErrorMessage(`Laravel Runner failed: ${message}`);

      this.webviewManager.updateWebView(
        `Laravel Runner failed:\n${message}`,
        true,
        false,
      );

      this.currentProcess = null;
      eventBus.setRunning(false);
    }
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
    workspaceRoot: string | null,
    phpFileUri?: vscode.Uri,
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
    this.registerStopExecutionListener();

    const shouldUseShell =
      process.platform === "win32" &&
      (command.trim().toLowerCase() === "php" ||
        command.trim().toLowerCase().endsWith(".bat") ||
        command.trim().toLowerCase().endsWith(".cmd"));

    const childProcess = spawn(command, args, {
      cwd,
      shell: shouldUseShell,
      windowsHide: true,
    });

    let output = "";
    let errorOutput = "";

    childProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    childProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    childProcess.on("close", (code, signal) => {
      const wasKilled = this.killedProcesses.has(childProcess);

      if (this.currentProcess === childProcess) {
        this.currentProcess = null;
        eventBus.setRunning(false);
      }

      if (wasKilled) {
        return;
      }

      const finalOutput = output || errorOutput;

      if (code !== 0) {
        this.webviewManager.updateWebView(
          finalOutput || `Process exited with code ${code}, signal ${signal}`,
          true,
          false,
        );
      } else {
        this.webviewManager.updateWebView(finalOutput || "null", false, false);
      }
    });

    childProcess.on("error", (err) => {
      if (this.currentProcess === childProcess) {
        this.currentProcess = null;
        eventBus.setRunning(false);
      }

      const message = [
        `Error running PHP: ${err.message}`,
        "",
        `PHP path used: ${command}`,
        "",
        "If you use Laravel Herd, set laravelRunner.phpPath to Herd's php.exe path, for example:",
        "C:\\Users\\<your-user>\\.config\\herd\\bin\\php83\\php.exe",
      ].join("\n");

      this.webviewManager.updateWebView(
        errorOutput || output || message,
        true,
        false,
      );
      vscode.window.showErrorMessage(
        `Error running PHP using "${command}": ${err.message}`,
      );
    });

    return childProcess;
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
    const process = this.currentProcess;

    if (!process) {
      eventBus.setRunning(false);
      this.webviewManager.sendScriptKilledMessage();
      return;
    }

    this.killedProcesses.add(process);

    try {
      process.kill("SIGTERM");
    } catch {
      // Process may already be gone.
    }

    if (this.currentProcess === process) {
      this.currentProcess = null;
    }

    eventBus.setRunning(false);
    this.webviewManager.sendScriptKilledMessage();
  }

  public getConfig() {
    return this.config;
  }

  public getPathUtils() {
    return this.pathUtils;
  }
}
