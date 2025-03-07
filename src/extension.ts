import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { WebviewManager } from './core/services/WebviewManager';
import { CodeLensProvider } from './core/providers/CodeLensProvider';
import { TinkerRunner } from './core/services/TinkerRunner';
import { Config } from './core/utils/Config';

export class ExtensionManager {
    private webviewManager: WebviewManager;
    private tinkerRunner: TinkerRunner;
    private context: vscode.ExtensionContext;
    private config: Config;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.webviewManager = new WebviewManager(context);
        this.tinkerRunner = new TinkerRunner(context, this.webviewManager);
        this.config = Config.getInstance();

    }

    /**
     * Activates the extension and registers commands & providers.
     */
    public activate() {
        console.log("🚀 Laravel Tinker extension activated!");

        this.tinkerRunner.copyTinkerScript();
        this.registerProviders();
        this.registerCommands();
    }

    /**
     * Registers the CodeLens provider for PHP files.
     */
    private registerProviders() {
        const provider = new CodeLensProvider();
        const providerRegistration = vscode.languages.registerCodeLensProvider(
            { language: 'php', scheme: 'file' },
            provider
        );
        this.context.subscriptions.push(providerRegistration);
    }

    /**
     * Registers VSCode commands for the extension.
     */
    private registerCommands() {
        const runPhpFileCommand = vscode.commands.registerCommand('myExtension.runPhpFile', (fileUri?: vscode.Uri) => {
            this.tinkerRunner.runPhpFile(fileUri);
        });

        const clearOutputCommand = vscode.commands.registerCommand('myExtension.clearOutput', () => {
            if (this.webviewManager.outputPanel) {
                this.webviewManager.outputPanel.webview.postMessage({ command: 'clearOutput' });
            } else {
                vscode.window.showInformationMessage('No output to clear.');
            }
        });

        const focusSearchBarCommand = vscode.commands.registerCommand("myExtension.focusSearchBar", () => {
            if (this.webviewManager.outputPanel) {
                this.webviewManager.outputPanel.webview.postMessage({ command: "focusSearchBar" });
            } else {
                vscode.window.showInformationMessage("No output panel open.");
            }
        });

        const commands = [
            runPhpFileCommand,
            clearOutputCommand,
            focusSearchBarCommand
        ];

        this.context.subscriptions.push(...commands);
    }

    /**
     * Cleans up the extension when it is deactivated.
     */
    public deactivate() {
        this.removeTinkerRunner();
    }

    /**
     * Removes Laravel Tinker Runner files when the extension is uninstalled.
     */
    private removeTinkerRunner() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const projectRoot = workspaceFolders[0].uri.fsPath;
        const extensionPublisherDirInLaravelVendor = path.join(projectRoot, 'vendor', this.config.get('publisher'));

        if (fs.existsSync(extensionPublisherDirInLaravelVendor)) {
            fs.rmSync(extensionPublisherDirInLaravelVendor, { recursive: true, force: true });
            vscode.window.showInformationMessage("❌ Laravel Tinker Runner has been removed from your Laravel project");
        }
    }
}

/**
 * Called when the extension is activated.
 */
export function activate(context: vscode.ExtensionContext) {
    const extensionManager = new ExtensionManager(context);
    extensionManager.activate();
}

/**
 * Called when the extension is deactivated.
 */
export function deactivate() {
    const extensionManager = new ExtensionManager({} as vscode.ExtensionContext);
    extensionManager.deactivate();
}
