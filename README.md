# Lara Run – Laravel Code Runner & Tinker for VS Code

**Run and debug Laravel / PHP code with one click — right inside VS Code.**

- 🖍️ Color-coded, searchable output — plus a handy stop button.  
- 💡 Full IntelliSense, autocompletion, and linting — powered by your existing PHP extensions.  
- 🪄 Smart formatting for `code`, `errors`, and `logs` speeds up debugging.

---

![Run Laravel code in VS Code – Lara Run demo](https://raw.githubusercontent.com/ali-raza-saleem/lara-run/master/demo/setup.gif)

---

## ✨ Key Features – Run Laravel Snippets in VS Code

| Feature | Description |
|---------|-------------|
| 💡 **Full IntelliSense & linting** | Real `.php` files mean extensions like **Intelephense**, **PHP CS Fixer**, and snippets work out of the box. |
| 🎨 **Color-coded output** | Errors, dumps, and logs are syntax-highlighted for instant readability. |
| 🔍 **Searchable logs** | Instantly highlight matches as you type. Find variables fast. |
| 🛑 **Stop button** | Hung or runaway script? Hit **Stop** to cancel execution immediately. |
| ⚡ **One-click execution** | Press `Ctrl+Alt+R` / `Cmd+Alt+R` or use the **▶ Run PHP File (Lara Run)** action. |
| 🧘 **Smart activation** | Only activates inside Laravel projects. |
| 🌍 **Cross-platform support** | macOS, Windows, Linux, WSL, and remote SSH–it all works. |

---

## ⚡ Quick Start – How to Run Laravel Code (60 sec)

### 🔧 Option A: Use the built-in **Lara Run: Install** command

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Select **Lara Run: Install**
3. It creates and opens `.playground/hello.php` with a sample snippet.
4. Press **▶ Run PHP File (Lara Run)** or use `Ctrl+Alt+R` / `Cmd+Alt+R`


### 📁 Option B: Create manually

```bash
laravel‑app-folder/
└─ .playground/
   └─ hello.php
```

```php
<?php
$name = 'VS Code';
"Hello, $name!";
```

Save → Run → View output in the sidebar panel.

---

## ⚙️ Settings & Configuration

(Settings › Extensions › Laravel Playground)

| Setting                                | Default       | What it does                                                                            |
| -------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `laraRun.playgroundFolder` | `.playground` | Change the folder where runnable .php files live.            |
| `laraRun.appendOutput`     | `true`        | `true` Keeps output from previous runs; `false` clears output of previous runs. |


---

## ❓ Quick answers

| Question                          | Answer                                                                                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Will it touch my DB?*            | Only if your code tells it to—safe by default.                                                                                                  |
| *Run on macOS / Linux / Windows?* | Yep! Fully supports all platforms, including WSL and remote SSH.                                                                           |
| *Got an error?*                   | [Open an issue](https://github.com/ali-raza-saleem/lara-run/issues) on GitHub.. |

---

### Commands

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
2. Run **Lara Run: Install** or open a `.playground/*.php` file
3. Click the **▶ Run PHP File** CodeLens to test output

---

## ⭐ Support the Project

If Lara Run saves you time, please:

* ⭐ [Star the GitHub repo](https://github.com/ali-raza-saleem/lara-run)
* 🧩 [Leave a quick review on the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ali-raza-saleem.lara-run&ssr=false#review-details)

Happy tinkering! 🛠️
