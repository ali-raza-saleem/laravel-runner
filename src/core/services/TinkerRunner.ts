import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { WebviewManager } from './WebviewManager';
import { Config } from '../utils/Config';
import { PathUtils } from '../utils/PathUtils';

export class TinkerRunner {
    private isRunning: boolean = false;
    private extensionUri: vscode.Uri;
    private webviewManager: WebviewManager;
    private config: Config;
    private pathUtils: PathUtils;
    private tinkerScriptName: string;

    constructor(context: vscode.ExtensionContext, webviewManager: WebviewManager) {
        this.extensionUri = context.extensionUri;
        this.webviewManager = webviewManager;

        Config.init(context);
        this.config = Config.getInstance();

        PathUtils.init(this.config); // Initialize PathUtils singleton
        this.pathUtils = PathUtils.getInstance();
        
        this.tinkerScriptName = this.config.get('customConfig.tinkerScriptName');



    }

    /**
     * Runs the given PHP file using the Tinker script and captures all output.
     * @param fileUri The URI of the PHP file to run.
     */
    public runPhpFile(fileUri?: vscode.Uri): void {
        if (this.isRunning) {
            vscode.window.showWarningMessage("Query in progress. Please wait...");
            return;
        }
        this.isRunning = true;

        const phpFileUri = fileUri ?? this.getActivePhpFileUri();
        const workspaceRoot = this.pathUtils.getWorkspaceRoot(phpFileUri);

        if (!this.canRunPhpFile(workspaceRoot, phpFileUri)) {
            this.isRunning = false;
            return;
        }

        const phpFileRelativePath = path.relative(workspaceRoot, phpFileUri.fsPath).replace(/\\/g, '/');
        const tinkerScriptPathInLaravelVendorDir = this.pathUtils.tinkerScriptPathInLaravelVendorDir(workspaceRoot);

        if (!fs.existsSync(tinkerScriptPathInLaravelVendorDir)) {
            vscode.window.showErrorMessage("Laravel Tinker Runner is missing. Please reload your project.");
            this.isRunning = false;
            return;
        }

        // ✅ Send "Running..." message to WebView
        this.webviewManager.updateWebView("Running...", false, true);

        // ✅ Execute the Tinker script
        this.evalScript('php', [tinkerScriptPathInLaravelVendorDir, phpFileRelativePath], workspaceRoot);
    }

    /**
     * Retrieves the currently active PHP file URI if available.
     * @returns The URI of the active PHP file, or null if none is found.
     */
    private getActivePhpFileUri(): vscode.Uri | null {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === 'php') {
            return activeEditor.document.uri;
        }

        vscode.window.showErrorMessage('No PHP file selected to run.');
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
            vscode.window.showErrorMessage('This command can only be run on PHP files inside a Laravel project.');
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
    private evalScript(command: string, args: string[], cwd: string): void {
        const process = spawn(command, args, { cwd });

        let output = '';
        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            output += data.toString();
        });

        process.on('close', (code) => {
            this.isRunning = false;

            if (code !== 0) {
                this.webviewManager.updateWebView(output || `Process exited with code ${code}`, true, false);
            } else {
                this.webviewManager.updateWebView(output || "No output from Custom Tinker.", false, false);
            }
        });

        process.on('error', (err) => {
            this.webviewManager.updateWebView(output || `Error running script: ${err.message}`, true, false);
            this.isRunning = false;
            vscode.window.showErrorMessage(`Error running script: ${err.message}`);
        });
    }

    /**
     * Copies the tinker.php script to the Laravel project's vendor directory if it does not exist.
     */
    public copyTinkerScriptToLaravel(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage("No workspace opened! Open a Laravel project.");
            return;
        }

        workspaceFolders.forEach((folder) => {
            if (!this.pathUtils.isLaravelProjectDir(folder.uri.fsPath)) {
                return;
            }
            
            const laravelWorkspaceRoot = folder.uri.fsPath;
            const tinkerScriptPathInLaravelVendorDir = this.pathUtils.tinkerScriptPathInLaravelVendorDir(laravelWorkspaceRoot);
            const laravelVendorExtensionDirectoryPath = this.pathUtils.laravelVendorExtensionDirectoryPath(laravelWorkspaceRoot);

            const tinkerScriptPathInExtension = path.join(this.extensionUri.fsPath, 'resources', this.tinkerScriptName);

            if (!fs.existsSync(laravelVendorExtensionDirectoryPath)) {
                fs.mkdirSync(laravelVendorExtensionDirectoryPath, { recursive: true });
            }

            if (!fs.existsSync(tinkerScriptPathInLaravelVendorDir)) {
                fs.copyFileSync(tinkerScriptPathInExtension, tinkerScriptPathInLaravelVendorDir);
                vscode.window.showInformationMessage("✅ Laravel Tinker Runner installed successfully.");
            }
        });
    }

}
