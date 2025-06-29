import * as vscode from "vscode";

export class CodeLensProvider implements vscode.CodeLensProvider {
  /**
   * Creates a CodeLens that allows running a PHP file using Laravel Tinker.
   * Only provides a "Run" CodeLens if the file is inside a `.playground/` folder.
   * @param document The active text document.
   * @param token A cancellation token.
   * @returns An array of CodeLens instances.
   */
  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken,
  ): vscode.CodeLens[] {
    const filePath = document.uri.fsPath;

    // ✅ Only show if inside `.playground/` folder
    if (!filePath.includes(`${vscode.workspace.rootPath}/.playground`)) {
      return [];
    }

    const range = new vscode.Range(0, 0, 0, 0);
    const command: vscode.Command = {
      title: "▶ Run PHP File (Laravel Playground)",
      command: "myExtension.runPhpFile",
      arguments: [document.uri],
    };

    return [new vscode.CodeLens(range, command)];
  }
}
