import { eventBus } from "./../services/EventBus";
import * as vscode from "vscode";
import * as path from "path";

export class CodeLensProvider
  implements vscode.CodeLensProvider, vscode.Disposable
{
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChange.event;
  private disposables: vscode.Disposable[] = [];

  constructor() {
    eventBus.on("scriptRunning", this.refresh);

    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(() => this.refresh()),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("laravelRunner.playgroundFolder")) {
          this.refresh();
        }
      }),
    );
  }

  public refresh = () => {
    this._onDidChange.fire();
  };

  public dispose() {
    eventBus.off("scriptRunning", this.refresh);
    this._onDidChange.dispose();
    this.disposables.forEach((d) => d.dispose());
  }

  provideCodeLenses(
    doc: vscode.TextDocument,
    _tok: vscode.CancellationToken,
  ): vscode.CodeLens[] {
    const ws = vscode.workspace.getWorkspaceFolder(doc.uri);
    if (!ws) return [];

    const playgroundFolder =
      vscode.workspace
        .getConfiguration("laravelRunner")
        .get<string>("playgroundFolder") ?? ".playground";

    const playgroundPath = path.join(ws.uri.fsPath, playgroundFolder);

    if (!doc.uri.fsPath.startsWith(playgroundPath + path.sep)) {
      return [];
    }

    const range = new vscode.Range(0, 0, 0, 0);
    const running = eventBus.isRunning();

    return [
      new vscode.CodeLens(range, {
        title: running ? "■ Stop PHP File" : "▶ Run PHP File (Laravel Runner)",
        command: running ? "myExtension.stopPhpFile" : "myExtension.runPhpFile",
        arguments: running ? [] : [doc.uri],
      }),
    ];
  }
}
