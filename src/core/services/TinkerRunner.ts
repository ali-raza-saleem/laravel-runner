import * as vscode from "vscode";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";
import { WebviewManager } from "./WebviewManager";
import { Config } from "../utils/Config";
import { PathUtils } from "../utils/PathUtils";

export class TinkerRunner {
    private currentProcess: ChildProcess | null = null;
    private extensionUri: vscode.Uri;
    private webviewManager: WebviewManager;
    private config: Config;
    private pathUtils: PathUtils;
    private tinkerScriptPath: string;
    private registeredStopExecutionListener: boolean = false;

    constructor(context: vscode.ExtensionContext, webviewManager: WebviewManager) {
        
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
            vscode.window.showWarningMessage("Query in progress. Please wait...");
            return;
        }

        const phpFileUri = this.getPhpFileUri();
        const workspaceRoot = this.pathUtils.getWorkspaceRoot(phpFileUri);

        if (!this.canRunPhpFile(workspaceRoot, phpFileUri)) {
            return;
        }

        const phpFileRelativePath = path.relative(workspaceRoot, phpFileUri.fsPath).replace(/\\/g, "/");
        const tinkerScriptAbsolutePath = path.join(this.extensionUri.fsPath, this.tinkerScriptPath);

        this.currentProcess = this.evalScript("php", [tinkerScriptAbsolutePath, phpFileRelativePath, workspaceRoot], workspaceRoot);
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

    private canRunPhpFile(workspaceRoot: string, phpFileUri?: vscode.Uri): boolean { 
        if (!phpFileUri) {
            vscode.window.showErrorMessage("No php file found.");
            return false;
        }

        if (!workspaceRoot) {
            vscode.window.showErrorMessage("No workspace found.");
            return false;
        }

        if (!this.pathUtils.fileIsInsideTinkerPlayground(workspaceRoot, phpFileUri)) {
            vscode.window.showErrorMessage("This command can only be run on PHP files inside a Laravel project.");
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
    private evalScript(command: string, args: string[], cwd: string): ChildProcess {

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

            if (code !== 0) {
                this.webviewManager.updateWebView(output || `Process exited with code ${code}`, true, false);
            } else {
                this.webviewManager.updateWebView(output || "No output returned by script.", false, false);
            }
        });

        process.on("error", (err) => {
            this.webviewManager.updateWebView(output || `Error running script: ${err.message}`, true, false);
            this.currentProcess = null;
            vscode.window.showErrorMessage(`Error running script: ${err.message}`);
        });


        return process;
    }

    public registerStopExecutionListener() {
        const outputPanel = this.webviewManager.outputPanel;
        if (!outputPanel) { 
            this.webviewManager.createOutputPanel();
        }

        if (this.registeredStopExecutionListener) {
            return;
        }

        this.webviewManager.outputPanel?.webview.onDidReceiveMessage((message) => {        
            if (message.command === "stopExecution") {
                this.stopExecution();
            }
        });

        this.registeredStopExecutionListener = true;
        
    }

    /**
     * Stops the currently running PHP process.
     */
    public stopExecution(): void {
        
        if (this.currentProcess) {
            this.currentProcess.kill("SIGTERM"); // ✅ Terminate the process gracefully
            this.currentProcess = null;
                        
            // ✅ Update WebView to hide loader & stop button
            this.webviewManager.sendScriptKilledMessage();
        }
    }

}
