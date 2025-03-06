import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import * as fs from 'fs';
import { spawn } from 'child_process';


let outputPanel: vscode.WebviewPanel | null = null;
let EXTENSION_URI: vscode.Uri;

/**
 * Activates the extension and registers:
 * 1) A CodeLens provider that shows a "Run" button in PHP files.
 * 2) A command that executes those files with Laravel Custom Tinker.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("Laravel Tinker extension activated!");
  EXTENSION_URI = context.extensionUri;

  // ✅ Copy LaravelTinkerRun.php to the Laravel project when extension is activated
  copyLaravelTinkerCommand();

  const provider = new PhpRunCodeLensProvider();
  const providerRegistration = vscode.languages.registerCodeLensProvider(
      { language: 'php', scheme: 'file' },
      provider
  );
  context.subscriptions.push(providerRegistration);

  const runCommand = vscode.commands.registerCommand('myExtension.runPhpFile', (fileUri: vscode.Uri) => {
      runPhpFile(fileUri);
  });
  context.subscriptions.push(runCommand);

  const clearOutputCommand = vscode.commands.registerCommand('myExtension.clearOutput', () => {
      if (outputPanel) {
          outputPanel.webview.postMessage({ command: 'clearOutput' });
      } else {
          vscode.window.showInformationMessage('No output to clear.');
      }
  });
  context.subscriptions.push(clearOutputCommand);

  const focusSearchBarCommand = vscode.commands.registerCommand("myExtension.focusSearchBar", () => {
      if (outputPanel) {
          outputPanel.webview.postMessage({ command: "focusSearchBar" });
      } else {
          vscode.window.showInformationMessage("No output panel open.");
      }
  });
  context.subscriptions.push(focusSearchBarCommand);
}

/**
 * Copies LaravelTinkerRun.php to the Laravel app/Console/Commands/LaravelTinkerRunner directory.
 */
function copyLaravelTinkerCommand() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened! Open a Laravel project.");
      return;
  }

  const projectRoot = workspaceFolders[0].uri.fsPath;
  const laravelCommandsPath = path.join(projectRoot, 'app', 'Console', 'Commands', 'LaravelTinkerRunner');
  const destPath = path.join(laravelCommandsPath, 'LaravelTinkerRun.php');
  const sourcePath = path.join(EXTENSION_URI.fsPath, 'commands', 'LaravelTinkerRun.php');

  // Ensure the directory exists
  if (!fs.existsSync(laravelCommandsPath)) {
      fs.mkdirSync(laravelCommandsPath, { recursive: true });
  }

  // Copy the file only if it doesn’t already exist
  if (!fs.existsSync(destPath)) {
      fs.copyFileSync(sourcePath, destPath);
      vscode.window.showInformationMessage("✅ LaravelTinkerRun.php has been installed in your Laravel project.");
  }
}

/**
* Removes LaravelTinkerRun.php when the extension is uninstalled.
*/
export function deactivate() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;

  const projectRoot = workspaceFolders[0].uri.fsPath;
    if (!cachedLaravelRoots.includes(projectRoot)) {
        console.log("❌ Not a Laravel project. Skipping LaravelTinkerRun.php copy.");
        return;
    }
  const destPath = path.join(projectRoot, 'app', 'Console', 'Commands', 'LaravelTinkerRunner', 'LaravelTinkerRun.php');

  if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
      vscode.window.showInformationMessage("❌ LaravelTinkerRun.php has been removed from your Laravel project.");
  }
}


/**
 * Provides a "Run" CodeLens at the top of every PHP file.
 */
class PhpRunCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        if (!isInsideWorkspaceDirectory(document.uri)) {
          return [];
        }
        const topOfFile = new vscode.Range(0, 0, 0, 0);
        const command: vscode.Command = {
            title: "▶ Run PHP File (Laravel Tinker)",
            command: "myExtension.runPhpFile",
            arguments: [document.uri]
        };
        return [new vscode.CodeLens(topOfFile, command)];
    }
}

/**
 * Runs the given PHP file using `php artisan laravel-tinker:run {file}` and captures all output.
 */
function runPhpFile(fileUri?: vscode.Uri) {
  if (!fileUri) {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && activeEditor.document.languageId === 'php') {
          fileUri = activeEditor.document.uri;
      } else {
          vscode.window.showErrorMessage('No PHP file selected to run.');
          return;
      }
  }

  if (!isInsideWorkspaceDirectory(fileUri)) {
      vscode.window.showErrorMessage('This command can only be run on PHP files inside the workspace directory of a Laravel project.');
      return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder found.');
      return;
  }

  let projectRoot = workspaceFolders[0].uri.fsPath.replace(/\\/g, '/');
  let relativePath = path.relative(projectRoot, fileUri.fsPath).replace(/\\/g, '/');

  // ✅ Send "Running..." message to WebView
  updateWebView("Running...", false, true);

  const process = spawn('php', ['artisan', 'laravel-tinker:run', relativePath], { cwd: projectRoot });

  let output = '';
  process.stdout.on('data', (data) => {
      output += data.toString();
  });

  process.stderr.on('data', (data) => {
      output += data.toString();
  });

  process.on('close', (code) => {
      if (code !== 0) {
          updateWebView(output || `Process exited with code ${code}`, true, false);
      } else {
          updateWebView(output || "No output from Custom Tinker.", false, false);
      }
  });
}


/**
 * Updates the existing WebView panel with new content, or creates one if needed.
 * The new output is appended to the container in the webview.
 */
function updateWebView(content: string, isError: boolean = false, isRunning: boolean = false) {
  if (!outputPanel) {
      outputPanel = vscode.window.createWebviewPanel(
          'tinkerOutput',
          'Laravel Tinker Output',
          vscode.ViewColumn.Beside,
          { enableScripts: true }
      );
      outputPanel.webview.html = getWebviewContent(outputPanel.webview, EXTENSION_URI);
      outputPanel.onDidDispose(() => {
          outputPanel = null;
      });
  }

  // ✅ Send message to WebView to update content and show/hide loader
  outputPanel.webview.postMessage({ command: 'updateOutput', content, isError, isRunning });
}



/**
 * Checks if the given file is inside the "workspace" directory of a Laravel project.
 */
let cachedLaravelRoots: string[] = [];

// ✅ Ensure Laravel projects are detected dynamically
function refreshLaravelRoots() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        cachedLaravelRoots = [];
        return;
    }

    cachedLaravelRoots = workspaceFolders
        .map(folder => folder.uri.fsPath)
        .filter(root => fs.existsSync(path.join(root, 'artisan')) && fs.existsSync(path.join(root, 'workspace')));
}

// ✅ Call this function at the beginning to ensure cache is set initially
refreshLaravelRoots();

function isInsideWorkspaceDirectory(fileUri: vscode.Uri): boolean {
    // ✅ Ensure cache is valid before using it (check if paths still exist)
    cachedLaravelRoots = cachedLaravelRoots.filter(root => 
        fs.existsSync(path.join(root, 'artisan')) && fs.existsSync(path.join(root, 'workspace'))
    );

    return cachedLaravelRoots.some(root => fileUri.fsPath.startsWith(path.join(root, 'workspace')));
}

// ✅ Listen for workspace changes and refresh the cache dynamically
vscode.workspace.onDidChangeWorkspaceFolders(() => {
    refreshLaravelRoots();
});


/**
 * Returns the HTML content for the webview.
 * The HTML includes a container for output, a Clear button, and a Search bar.
 * References external JS files (highlight.min.js, mark.min.js, and utils.js) from the media folder.
 */
function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const highlightJsPath = vscode.Uri.joinPath(extensionUri, 'media', 'highlight.min.js');
    const highlightCssPath = vscode.Uri.joinPath(extensionUri, 'media', 'atom-one-dark.css');
    const utilsJsPath = vscode.Uri.joinPath(extensionUri, 'media', 'utils.js');
    const markJsPath = vscode.Uri.joinPath(extensionUri, 'media', 'mark.min.js');

    const highlightJsUri = webview.asWebviewUri(highlightJsPath);
    const highlightCssUri = webview.asWebviewUri(highlightCssPath);
    const utilsJsUri = webview.asWebviewUri(utilsJsPath);
    const markJsUri = webview.asWebviewUri(markJsPath);

    return `
<html>
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="${highlightCssUri}" />
  <style>
    body {
      font-family: Consolas, 'Courier New', monospace;
      background: #1e1e1e;
      color: #ffffff;
      padding: 1em;
      margin: 0;
      overflow: hidden;
    }
    #controls {
      padding: 0.5em;
      background: #252526;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1em;
    }
    #clear-button {
      background-color: #673ab7;
      color: #f5f5f5;
      border: none;
      padding: 0.5em 1em;
      border-radius: 3px;
      cursor: pointer;
    }
    #search-input {
      padding: 0.5em;
      border-radius: 3px;
      border: 1px solid #444;
      background: #1e1e1e;
      color: #ffffff;
    }
    #output-container {
      padding: 1em;
      background: #1e1e1e;
      height: calc(100vh - 70px);
      overflow-y: auto;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      background: #252526;
      padding: 1em;
      border-radius: 5px;
      margin-bottom: 1em;
    }
    code {
      font-family: Consolas, 'Courier New', monospace;
    }
    .highlight {
      background-color: #673ab7;
      color: #f5f5f5;
    }

    #loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 2em;
    color: #ffffff;
}
    #loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 2em;
    color: #ffffff;
}

    .loader {
        border: 5px solid rgba(255, 255, 255, 0.3);
        border-top: 5px solid #ffffff;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

  </style>
</head>
<body>
  <div id="controls">
    <input id="search-input" type="text" placeholder="Search output..." />
    <button id="clear-button">Clear Output</button>
  </div>
  <div id="output-container"></div>

  <!-- Load external JS files -->
  <script src="${highlightJsUri}"></script>
  <script src="${markJsUri}"></script>
  <script src="${utilsJsUri}"></script>
  <script src="${webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'outputHandler.js'))}"></script>

</body>
</html>
`;
}

/**
 * Utility to escape HTML special characters.
 */
function escapeHtml(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
