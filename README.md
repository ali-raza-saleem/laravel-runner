# Laravel Playground

**Run Laravel PHP code instantly—right where you write it.**

Laravel Playground lets you run and debug Laravel-flavored PHP right inside VS Code — just drop your snippet into **.playground/**, hit ▶ Run, and dive into beautiful, color-coded output in the sidebar.

---

## ✨ Features

* **Colour-coded output** – Clear and readable results in the sidebar.
* **Searchable console** – Auto-highlighted search as you type.
* **Panic button** – Hung script? Instantly stop execution.
* **Zero config** – Just drop in a file and go.
* **Smart activation** – Only activates inside Laravel projects (auto-detects `artisan`).
* **Cross-platform** – macOS, Linux, Windows, WSL, SSH — it works.

---

## 🚀 Getting Started

You can set up the playground in two ways:

### 🔧 Option A: Use the Command Palette

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run **Laravel Playground: Install**
3. This creates a `.playground/hello.php` file with a ready-to-run snippet.
4. Hit **▶ Run PHP File (Laravel Playground)** or press `Ctrl+Alt+R` / `Cmd+Alt+R`

### 📁 Option B: Create Manually

```bash
laravel-app/
└─ .playground/
   └─ hello.php
```

```php
<?php
$name = 'VS Code';
"Hello, $name!";
```

Save and run — that’s it.

---

## 🎬 Demo

See it in action:

Coming soon..

---

## ⚙️ Configuration

| Setting                              | Default       | Description                                                                            |
| ------------------------------------ | ------------- | -------------------------------------------------------------------------------------- |
| `laravelPlayground.playgroundFolder` | `.playground` | Folder containing runnable PHP files                                                   |
| `laravelPlayground.appendOutput`     | `true`        | If true, appends new output below existing logs; if false, replaces output on each run |

Access these in **VS Code Settings → Extensions → Laravel Playground**.

---

## 💻 Development

### Setup

```bash
git clone https://github.com/ali-raza-saleem/laravel-playground.git
cd laravel-playground
npm install
```

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
2. Run **Laravel Playground: Install** or open a `.playground/*.php` file
3. Click the **▶ Run PHP File** CodeLens to test output

---

## 💬 FAQ

| Question                          | Answer                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Will it touch my DB?              | Only if your code tells it to. Otherwise, it’s read-only.                                            |
| Works on macOS / Linux / Windows? | Yes — including WSL and remote SSH.                                                                  |
| Having trouble?                   | [Open an issue](https://github.com/ali-raza-saleem/laravel-playground/issues) and we’ll take a look. |

---

## ⭐ Support

If this helped you, **star the repo** and leave a review on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ali-raza-saleem.laravel-playground).

Happy tinkering! 🛠️
