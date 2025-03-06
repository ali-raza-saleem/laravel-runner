import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { WebviewManager } from './WebviewManager';

export class TinkerRunner {
    private isRunning: boolean = false;
    private extensionUri: vscode.Uri;
    private webviewManager: WebviewManager;

    constructor(context: vscode.ExtensionContext, webviewManager: WebviewManager) {
        this.extensionUri = context.extensionUri;
        this.webviewManager = webviewManager;
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
        if (!phpFileUri) {
            this.isRunning = false;
            return;
        }

        if (!this.isInsideLaravelRoot(phpFileUri)) {
            vscode.window.showErrorMessage('This command can only be run on PHP files inside a Laravel project.');
            this.isRunning = false;
            return;
        }

        const workspaceRoot = this.getWorkspaceRoot(phpFileUri);
        if (!workspaceRoot) {
            vscode.window.showErrorMessage("No workspace found.");
            this.isRunning = false;
            return;
        }

        const relativePath = path.relative(workspaceRoot, phpFileUri.fsPath).replace(/\\/g, '/');
        const tinkerScriptPath = path.join(workspaceRoot, 'vendor', 'ali-raza-saleem', 'laravel-tinker-runner', 'tinker.php');

        if (!fs.existsSync(tinkerScriptPath)) {
            vscode.window.showErrorMessage("Laravel Tinker Runner is missing. Please reload your project.");
            this.isRunning = false;
            return;
        }

        // ✅ Send "Running..." message to WebView
        this.webviewManager.updateWebView("Running...", false, true);

        // ✅ Execute the Tinker script
        this.evalScript('php', [tinkerScriptPath, relativePath], workspaceRoot);
    }

    /**
     * Copies the tinker.php script to the Laravel project's vendor directory if it does not exist.
     */
    public copyTinkerScript(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage("No workspace opened! Open a Laravel project.");
            return;
        }

        workspaceFolders.forEach((folder) => {
            if (!this.isInsideLaravelRoot(folder.uri)) {
                return;
            }

            const vendorDir = path.join(folder.uri.fsPath, 'vendor', 'ali-raza-saleem', 'laravel-tinker-runner');
            const destPath = path.join(vendorDir, 'tinker.php');
            const sourcePath = path.join(this.extensionUri.fsPath, 'resources', 'tinker.php');

            if (!fs.existsSync(vendorDir)) {
                fs.mkdirSync(vendorDir, { recursive: true });
            }

            if (!fs.existsSync(destPath)) {
                fs.copyFileSync(sourcePath, destPath);
                vscode.window.showInformationMessage("✅ Laravel Tinker Runner installed successfully.");
            }
        });
    }

    /**
     * Checks if the given file is inside a Laravel workspace directory.
     * @param fileUri The URI of the file.
     * @returns True if the file is inside a Laravel project, false otherwise.
     */
    private isInsideLaravelRoot(fileUri: vscode.Uri): boolean {
        const workspaceRoot = this.getWorkspaceRoot(fileUri);
        if (!workspaceRoot) {
            return false;
        }
        return fs.existsSync(path.join(workspaceRoot, 'artisan'));
    }

    /**
     * Gets the workspace root for a given file URI.
     * @param fileUri The URI of the file.
     * @returns The root path of the workspace if found, otherwise null.
     */
    private getWorkspaceRoot(fileUri: vscode.Uri): string | null {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return null;
        }

        const workspace = workspaceFolders.find(folder => fileUri.fsPath.startsWith(folder.uri.fsPath));
        return workspace ? workspace.uri.fsPath : null;
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
}
