# Lara Run – Laravel Code Runner & Tinker for VS Code

**Run and debug Laravel / PHP code with one click — right inside VS Code.**

<p align="center">
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/lara-run/master/demo/setup.gif"
       width="1000"
       alt="Run Laravel code in VS Code – Lara Run demo">
</p>

---

## ⚡ Quick Start – Use the built-in **Lara Run: Install** command

1. Open the Command Palette: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>  
2. Type `Lara Run` and select **Lara Run: Install**. This generates a ready-to-run `.playground/hello.php` file to get you started instantly.
3. Just hit **▶ Run PHP File (Lara Run)** or press <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> to see color-coded output in the sidebar.

---

## Key Features

* **💡 IntelliSense & linting** – Real `.php` files with full support from Intelephense, CS Fixer, snippets, and more.  
* **🎨 Color-coded output** – Errors, dumps, and logs are syntax-highlighted for instant readability.  
* **🔍 Searchable logs** – Instantly highlight matches as you type — even across long output.  
* **🛑 Stop button** – Hung or runaway script? Instantly cancel with a click.  
* **⚡ One-click execution** – Press `Ctrl+Alt+R` or click **▶ Run PHP File (Lara Run)**.  
* **🧘 Smart activation** – Only loads inside Laravel projects (auto-detects `artisan`).  
* **🌍 Cross-platform** – Works on macOS, Linux, Windows, WSL, and remote SSH.


---

## Visual Tour – Lara Run in Action

### Color-Coded Output Panel
Tailored colors for code results, errors, and logs—see issues at a glance.
<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/lara-run/master/demo/normal_output.png" width="500" alt="Lara Run autocomplete with Laravel model and IntelliSense in VS Code">
</p>
<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/lara-run/master/demo/error_display.png" width="500"  alt="Color-coded Laravel output panel showing echo, log, and exception">
</p>


### Live Search & Highlight
Live search to jump to variables or values inside long outputs.
As you type, matches are instantly highlighted — even across multiple lines.
<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/lara-run/master/demo/highlighted_search.png" width="500"  alt="Lara Run live search highlighting in output panel">
</p>

### Stop Hung Scripts Instantly
Hit the stop button (in red) to kill runaway loops or stuck processes — no need to restart VS Code or kill terminals.

<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/lara-run/master/demo/stop_button.png" width="500"  alt="Lara Run stop button cancels long-running PHP script">
</p>

### IntelliSense & Autocomplete
Real `.php` files mean you get full IntelliSense, autocompletion, linting, and Copilot suggestions—powered by your existing PHP extensions like Intelephense or CS Fixer.

<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/lara-run/master/demo/powered_by_existing_extensions.png" width="500" alt="Lara Run autocomplete with Laravel model and IntelliSense in VS Code">
</p>

---

## Settings & Configuration

Change the folder where PHP files live or choose whether output should persist across runs.  
**Settings > Extensions > Lara Run:**


<p>
  <img src="https://raw.githubusercontent.com/ali-raza-saleem/lara-run/master/demo/config.png" width="720" alt="Lara Run settings in VS Code: playground folder and append output">
</p>


---

## Quick answers

| Question                          | Answer                                                                                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Will it touch my DB?*            | Only if your code tells it to—safe by default.                                                                                                  |
| *Run on macOS / Linux / Windows?* | Yep! Fully supports all platforms, including WSL and remote SSH.                                                                           |
| *Got an error?*                   | [Open an issue](https://github.com/ali-raza-saleem/lara-run/issues) on GitHub.. |

---

## Support the Project

If Lara Run saves you time, please:

* ⭐ [Star the GitHub repo](https://github.com/ali-raza-saleem/lara-run)
* 🧩 [Leave a quick review on the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ali-raza-saleem.lara-run&ssr=false#review-details)

Happy tinkering! 🛠️
