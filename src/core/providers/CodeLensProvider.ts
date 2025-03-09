import * as vscode from "vscode";

export class CodeLensProvider implements vscode.CodeLensProvider {
  /**
   * Creates a CodeLens that allows running a PHP file using Laravel Tinker.
   * Provides a "Run" CodeLens at the top of every PHP file inside the workspace.
   * @param document The active text document.
   * @param token A cancellation token.
   * @returns An array of CodeLens instances.
   */
  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken,
  ): vscode.CodeLens[] {
    const range = new vscode.Range(0, 0, 0, 0);
    const command: vscode.Command = {
      title: "▶ Run PHP File (Laravel Tinker)",
      command: "myExtension.runPhpFile",
      arguments: [document.uri],
    };
    return [new vscode.CodeLens(range, command)];
  }
}
