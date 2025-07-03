# Laravel Runner – Laravel Code Runner & Tinker for VS Code

**Run and debug Laravel / PHP code with one click — right inside VS Code.**

<p align="center">
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/laravel-runner/master/demo/setup.gif"
       width="1000"
       alt="Run Laravel code in VS Code – Laravel Runner demo">
</p>

---

## ⚡ Quick Start – Use the built-in **Laravel Runner: Install** command

1. Open the Command Palette: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>  
2. Type `Laravel Runner` and select **Laravel Runner: Install**. This generates a ready-to-run `.playground/hello.php` file to get you started instantly.
3. Just hit **▶ Run PHP File (Laravel Runner)** or press <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> to see color-coded output in the sidebar.

---

## Key Features

* **⚡ One-click execution** – Press `Ctrl+Alt+R` or click **▶ Run PHP File (Laravel Runner)**.  
* **🎨 Color-coded output** – Errors, dumps, and logs are syntax-highlighted for instant readability.  
* **🔍 Searchable logs** – Instantly highlight matches as you type — even across long output.  
* **🛑 Stop button** – Hung or runaway script? Instantly cancel with a click.  
* **💡 IntelliSense & linting** – Real `.php` files with full support from Intelephense, CS Fixer, snippets, and more.  
* **🧘 Smart activation** – Only loads inside Laravel projects (auto-detects `artisan`).  
* **🌍 Cross-platform** – Works on macOS, Linux, Windows, WSL, and remote SSH.


---

## Visual Tour – Laravel Runner in Action

### Color-Coded Output Panel
Tailored colors for code results, errors, and logs—see issues at a glance.
<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/laravel-runner/master/demo/normal_output.png" width="500" alt="Laravel Runner autocomplete with Laravel model and IntelliSense in VS Code">
</p>
<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/laravel-runner/master/demo/error_display.png" width="500"  alt="Color-coded Laravel output panel showing echo, log, and exception">
</p>


### Live Search & Highlight
Live search to jump to variables or values inside long outputs.
As you type, matches are instantly highlighted — even across multiple lines.
<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/laravel-runner/master/demo/highlighted_search.png" width="500"  alt="Laravel Runner live search highlighting in output panel">
</p>

### Stop Hung Scripts Instantly
Hit the stop button (in red) to kill runaway loops or stuck processes — no need to restart VS Code or kill terminals.

<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/laravel-runner/master/demo/stop_button.png" width="500"  alt="Laravel Runner stop button cancels long-running PHP script">
</p>

### IntelliSense & Autocomplete
Real `.php` files mean you get full IntelliSense, autocompletion, linting, and Copilot suggestions—powered by your existing PHP extensions like Intelephense or CS Fixer.

<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/laravel-runner/master/demo/powered_by_existing_extensions.png" width="500" alt="Laravel Runner autocomplete with Laravel model and IntelliSense in VS Code">
</p>

---

## Settings & Configuration

Change the folder where PHP files live or choose whether output should persist across runs.  
**Settings > Extensions > Laravel Runner:**


<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/laravel-runner/master/demo/config.png" width="720" alt="Laravel Runner settings in VS Code: playground folder and append output">
</p>

---

### Development

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm run build`         | Build extension with Webpack for production |
| `npm run lint`          | Run ESLint on `src/` and `resources/js/`    |
| `npm run format`        | Format code using Prettier                  |
| `npm run fix-style`     | Format + lint autofix                       |
| `npm run package`       | Build and package extension into `.vsix`    |
| `npm run package-patch` | Bump patch version and package              |
| `npm run package-minor` | Bump minor version and package              |
| `npm run package-major` | Bump major version and package              |

### Debugging in VS Code

1. Press `F5` to launch an Extension Development Host
2. Run **Laravel Runner: Install** or open a `.playground/*.php` file
3. Click the **▶ Run PHP File** CodeLens to test output


---

## Quick answers

| Question                          | Answer                                                                                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Will it touch my DB?*            | Only if your code tells it to—safe by default.                                                                                                  |
| *Run on macOS / Linux / Windows?* | Yep! Fully supports all platforms, including WSL and remote SSH.                                                                           |
| *Got an error?*                   | [Open an issue](https://github.com/ali-raza-saleem/laravel-runner/issues) on GitHub. |

---

## Support the Project

If Laravel Runner saves you time, please:

* ⭐ [Star the GitHub repo](https://github.com/ali-raza-saleem/laravel-runner)
* 🧩 [Leave a quick review on the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ali-raza-saleem.laravel-runner&ssr=false#review-details)

Happy tinkering! 🛠️
