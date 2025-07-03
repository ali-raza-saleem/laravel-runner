import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import { Config } from "../utils/Config";

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
  public updateWebView(
    content: string,
    isError: boolean = false,
    isRunning: boolean = false,
  ) {
    this.createOutputPanel();
    const appendOutput = Config.getInstance().get<boolean>("appendOutput");

    // ✅ Send message to WebView to update content and show/hide controls
    this.outputPanel.webview.postMessage({
      command: "updateOutput",
      content,
      isError,
      isRunning,
      appendOutput,
    });
  }

  public sendScriptStartedMessage() {
    this.createOutputPanel();
    this.outputPanel.webview.postMessage({ command: "scriptStarted" });
  }

  public sendScriptKilledMessage() {
    this.createOutputPanel();
    this.outputPanel.webview.postMessage({ command: "scriptKilled" });
  }

  public createOutputPanel() {
    if (!this.outputPanel) {
      this.outputPanel = vscode.window.createWebviewPanel(
        "laraRunOutputPanel",
        "Laravel Runner: Output Panel",
        vscode.ViewColumn.Beside,
        { enableScripts: true },
      );

      this.outputPanel.webview.html = this.getContent(this.outputPanel.webview);

      this.outputPanel.onDidDispose(() => {
        this.outputPanel = null;
      });
    }
  }

  /**
   * Retrieves the WebView content.7
   * @param webview The VSCode WebView instance.
   * @returns The HTML content string.
   */
  private getContent(webview: vscode.Webview): string {
    if (this.cachedHtml) {
      return this.cachedHtml;
    }

    const getResourceUri = (filePath: string) =>
      webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, filePath));

    const htmlPath = path.join(
      this.extensionUri.fsPath,
      "resources/html",
      "index.html",
    );

    this.cachedHtml = fs
      .readFileSync(htmlPath, "utf8")
      .replace(
        // App

        /\{\{appJsUri\}\}/g,
        getResourceUri("dist/app.min.js").toString(),
      )
      .replace(
        /\{\{appCssUri\}\}/g,
        getResourceUri("dist/app.min.css").toString(),
      )

      .replace(
        /\{\{highlightCssUri\}\}/g,
        getResourceUri("assets/css/atom-one-dark.min.css").toString(),
      );

    return this.cachedHtml;
  }
}
