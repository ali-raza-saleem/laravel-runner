import * as vscode from "vscode";
import * as path from "path";
import { WebviewManager } from "./core/services/WebviewManager";
import { CodeLensProvider } from "./core/providers/CodeLensProvider";
import { TinkerRunner } from "./core/services/TinkerRunner";
import { PathUtils } from "./core/utils/PathUtils";

export class ExtensionManager {
  private webviewManager: WebviewManager;
  private tinkerRunner: TinkerRunner;
  private context: vscode.ExtensionContext;
  private output: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext, output: vscode.OutputChannel) {
    this.context = context;
    this.output = output;
    this.webviewManager = new WebviewManager(context);
    this.tinkerRunner = new TinkerRunner(
      context,
      this.webviewManager,
      output,
    );
  }

  /**
   * Activates the extension and registers commands & providers.
   */
  public activate() {
    this.output.appendLine("ExtensionManager.activate() called");
    this.registerProviders();
    this.registerCommands();
    this.output.appendLine("Providers and commands registered");
  }

  /**
   * Registers the CodeLens provider for PHP files.
   */
  private registerProviders() {
    const provider = new CodeLensProvider();
    const providerRegistration = vscode.languages.registerCodeLensProvider(
      { language: "php", scheme: "file" },
      provider,
    );
    this.context.subscriptions.push(providerRegistration);
  }

  /**
   * Registers VSCode commands for the extension.
   */
  private registerCommands() {
    this.output.appendLine("Registering Laravel Runner commands");

    const runPhpFileCommand = vscode.commands.registerCommand(
      "myExtension.runPhpFile",
      () => {
        this.tinkerRunner.runPhpFile();
      },
    );

    const clearOutputCommand = vscode.commands.registerCommand(
      "myExtension.clearOutput",
      () => {
        if (this.webviewManager.outputPanel) {
          this.webviewManager.outputPanel.webview.postMessage({
            command: "clearOutput",
          });
        } else {
          vscode.window.showInformationMessage("No output to clear.");
        }
      },
    );

    const focusSearchBarCommand = vscode.commands.registerCommand(
      "myExtension.focusSearchBar",
      () => {
        if (this.webviewManager.outputPanel) {
          this.webviewManager.outputPanel.webview.postMessage({
            command: "focusSearchBar",
          });
        } else {
          vscode.window.showInformationMessage("No output panel open.");
        }
      },
    );

    const stopFileCommand = vscode.commands.registerCommand(
      "myExtension.stopPhpFile",
      () => this.tinkerRunner.stopExecution(),
    );

    const installPlaygroundCommand = this.registerInstallPlaygroundCommand();

    this.context.subscriptions.push(
      runPhpFileCommand,
      stopFileCommand,
      clearOutputCommand,
      focusSearchBarCommand,
      installPlaygroundCommand,
    );

    this.output.appendLine("Laravel Runner commands registered successfully");
  }

  private registerInstallPlaygroundCommand() {
    return vscode.commands.registerCommand(
      "myExtension.installPlayground",
      async () => {
        /* ── Sanity checks ────────────────────────────────────────── */
        const folders = vscode.workspace.workspaceFolders;
        if (!folders?.length) {
          vscode.window.showWarningMessage("Open a Laravel project first.");
          return;
        }

        const root = folders[0].uri.fsPath;
        const pathUtils = PathUtils.getInstance();
        if (!pathUtils.isLaravelProjectDir(root)) {
          vscode.window.showWarningMessage(
            "Can only install inside Laravel project",
          );
          return;
        }

        /* ── Resolve playground path ─────────────────────────────── */
        const playgroundFolder =
          vscode.workspace
            .getConfiguration("laravelRunner")
            .get<string>("playgroundFolder") ?? ".playground";

        const playgroundPath = path.join(root, playgroundFolder);
        const playgroundUri = vscode.Uri.file(playgroundPath);

        /* ── Resolve stub source folder inside the extension ─────── */
        const stubsPath = path.join(
          this.context.extensionPath,
          "resources",
          "stubs",
        );
        const stubsUri = vscode.Uri.file(stubsPath);

        try {
          /* 1 ▸ Ensure destination directory exists */
          await vscode.workspace.fs.createDirectory(playgroundUri);

          /* 2 ▸ Enumerate all PHP files under resources/stubs/ */
          const entries = await vscode.workspace.fs.readDirectory(stubsUri);

          for (const [name, fileType] of entries) {
            if (fileType !== vscode.FileType.File || !name.endsWith(".php")) {
              continue; // skip non-files and non-PHP
            }

            const src = vscode.Uri.file(path.join(stubsPath, name));
            const dest = vscode.Uri.file(path.join(playgroundPath, name));

            /* copy only if not already present */
            try {
              await vscode.workspace.fs.stat(dest); // exists → skip
            } catch {
              await vscode.workspace.fs.copy(src, dest);
            }
          }

          /* 3 ▸ Open hello.php if it was provided */
          const helloUri = vscode.Uri.file(
            path.join(playgroundPath, "hello.php"),
          );
          let doc: vscode.TextDocument | undefined;

          try {
            doc = await vscode.workspace.openTextDocument(helloUri);
          } catch {
            /* fallback: open any stub we copied */
            const firstStub = entries.find(
              ([n, t]) => t === vscode.FileType.File && n.endsWith(".php"),
            );
            if (firstStub) {
              const fallbackUri = vscode.Uri.file(
                path.join(playgroundPath, firstStub[0]),
              );
              doc = await vscode.workspace.openTextDocument(fallbackUri);
            }
          }

          if (doc) {
            await vscode.window.showTextDocument(doc, { preview: false });
          }

          vscode.window.showInformationMessage(
            `Playground ready → ${playgroundFolder}/hello.php. Click 'Run PHP File'`,
          );
        } catch (err) {
          const message =
            err instanceof Error ? (err.stack ?? err.message) : String(err);

          vscode.window.showErrorMessage(
            "Could not create the playground. Check Output > Laravel Runner.",
          );

          this.output.appendLine("Install playground failed:");
          this.output.appendLine(message);
        }
      },
    );
  }
}

/**
 * Called when the extension is activated.
 */
export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("Laravel Runner");
  context.subscriptions.push(output);

  output.appendLine("Laravel Runner activate() called");
  output.appendLine(`remoteName: ${vscode.env.remoteName ?? "local"}`);
  output.appendLine(`extensionPath: ${context.extensionPath}`);
  output.appendLine(`extensionUri: ${context.extensionUri.toString()}`);

  try {
    const extensionManager = new ExtensionManager(context, output);
    extensionManager.activate();

    output.appendLine("Laravel Runner activation completed");
  } catch (error) {
    output.appendLine("Laravel Runner activation failed:");
    output.appendLine(
      error instanceof Error ? (error.stack ?? error.message) : String(error),
    );

    vscode.window.showErrorMessage(
      "Laravel Runner failed to activate. Check Output > Laravel Runner.",
    );

    throw error;
  }
}

/**
 * Called when the extension is deactivated.
 */
export function deactivate() {
  //
}
