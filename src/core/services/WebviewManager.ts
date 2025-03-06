import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class WebviewManager {
    public outputPanel: vscode.WebviewPanel | null = null;
    private extensionUri: vscode.Uri;
    private cachedHtml: string | null = null;

    /**
     * Constructor initializes WebviewManager with extensionUri.
     * @param extensionUri The extension's URI.
     */
    constructor(context: vscode.ExtensionContext) {
        this.extensionUri = context.extensionUri;
    }

    /**
     * Updates the existing WebView panel with new content or creates one if needed.
     * The new output is sent to the WebView panel.
     * @param content The output content to display.
     * @param isError Whether it's an error message.
     * @param isRunning Whether script is currently running.
     */
    public updateWebView(content: string, isError: boolean = false, isRunning: boolean = false) {
        if (!this.outputPanel) {
            this.outputPanel = vscode.window.createWebviewPanel(
                'tinkerOutput',
                'Laravel Tinker Output',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );

            this.outputPanel.webview.html = this.getContent(this.outputPanel.webview);

            this.outputPanel.onDidDispose(() => {
                this.outputPanel = null;
            });
        }

        // ✅ Send message to WebView to update content and show/hide loader
        this.outputPanel.webview.postMessage({ command: 'updateOutput', content, isError, isRunning });
    }

    /**
     * Retrieves the WebView content.
     * @param webview The VSCode WebView instance.
     * @returns The HTML content string.
     */
    private getContent(webview: vscode.Webview): string {
        if (this.cachedHtml) {
            return this.cachedHtml;
        }
        
        const getResourceUri = (filePath: string) =>
            webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, filePath));

        const htmlPath = path.join(this.extensionUri.fsPath, 'resources/media', 'index.html');

        this.cachedHtml =  fs.readFileSync(htmlPath, 'utf8')
            .replace(/\{\{highlightCssUri\}\}/g, getResourceUri('resources/media/atom-one-dark.css').toString())
            .replace(/\{\{highlightJsUri\}\}/g, getResourceUri('resources/media/highlight.min.js').toString())
            .replace(/\{\{markJsUri\}\}/g, getResourceUri('resources/media/mark.min.js').toString())
            .replace(/\{\{outputHandlerUri\}\}/g, getResourceUri('resources/media/outputHandler.js').toString())
            .replace(/\{\{styleUri\}\}/g, getResourceUri('resources/media/styles.css').toString())
            .replace(/\{\{utilsJsUri\}\}/g, getResourceUri('resources/media/utils.js').toString());

        return this.cachedHtml;
    }
}
