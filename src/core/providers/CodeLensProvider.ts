import { eventBus } from "./../services/EventBus";
import * as vscode from "vscode";
import * as path from "path";

export class CodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChange.event;

  private running = false;

  constructor() {
    /* subscribe once, auto-refresh on change */
    eventBus.on("scriptRunning", (state) => {
      this.running = state;
      this._onDidChange.fire();
    });
  }

  provideCodeLenses(
    doc: vscode.TextDocument,
    _tok: vscode.CancellationToken,
  ): vscode.CodeLens[] {
    const ws = vscode.workspace.getWorkspaceFolder(doc.uri);
    if (!ws) return [];

    if (!doc.uri.fsPath.startsWith(path.join(ws.uri.fsPath, ".playground")))
      return [];

    const range = new vscode.Range(0, 0, 0, 0);
    const lenses = [];

    if (this.running) {
      lenses.push(
        new vscode.CodeLens(range, {
          title: "■ Stop PHP File",
          command: "myExtension.stopPhpFile",
        }),
      );
    } else {
      lenses.push(
        new vscode.CodeLens(range, {
          title: "▶ Run PHP File (Laravel Runner)",
          command: "myExtension.runPhpFile",
          arguments: [doc.uri],
        }),
      );
    }
    return lenses;
  }
}
