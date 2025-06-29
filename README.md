# Laravel Tinker Runner

A developer-focused VS Code extension for Laravel projects that lets you run and inspect any PHP file in a dedicated `.playground/` folder, with real Laravel context. Think of it like `tinker` but GUI-powered, snippet-friendly, and workflow-native.

---

## 🧪 What it does

* Runs any PHP file in `.playground/`, bootstrapped with Laravel.
* Shows pretty-printed dumps and streamed output in a dedicated side panel.
* Adds a clickable **▶ Run PHP File (Laravel Tinker)** CodeLens at the top of each snippet.
* Includes **Stop**, **Search**, **Clear**, and **Copy** buttons in the output panel.
* Automatically wraps the final expression in `return` to simulate REPL-style workflows.

---

## 📸 Demo

![Tinker Runner demo](https://raw.githubusercontent.com/ali-raza/laravel-tinker-runner/main/.github/demo.gif)

---

## 📦 Installation

```bash
extension install ali-raza-saleem.laravel-tinker-runner
```

Or search **Laravel Tinker Runner** in the VS Code Marketplace.

---

## ⚙️ Settings

```jsonc
{
  // Change if you want to use a different folder for snippets
  "laravelTinkerRunner.playgroundFolder": ".playground",

  // Append output below previous runs instead of replacing it
  "laravelTinkerRunner.appendOutput": true,

  // Optionally point to a custom tinker bootstrap script
  "laravelTinkerRunner.tinkerScriptPath": "/my/custom/path/tinker.php"
}
```

Accessible via **Settings → Extensions → Laravel Tinker Runner**.

---

## 🛠 Commands

| Command ID                           | Title                          | Shortcut |
| ------------------------------------ | ------------------------------ | -------- |
| `laravelTinkerRunner.runPhpFile`     | Run PHP File (Laravel Tinker)  | Ctrl/⌘⇧R |
| `laravelTinkerRunner.clearOutput`    | Clear Tinker Output            | —        |
| `laravelTinkerRunner.focusSearchBar` | Focus Tinker Output Search Bar | —        |

---

## 🧩 Architecture

* Uses a webview-based output panel, streamed via `WebviewManager.ts`.
* `TinkerRunner.ts` launches a child `php` process with a custom `tinker.php` that boots Laravel and evaluates the file.
* Return values are wrapped and dumped with Symfony Var-Dumper.
* Errors are caught and printed inline.
* `Config.ts` and `PathUtils.ts` manage settings and file validation.

---

## 🧪 Development

```bash
git clone https://github.com/ali-raza/laravel-tinker-runner.git
cd laravel-tinker-runner
npm install

# Launch Extension Host
devcontainers open .
# or
code . && F5
```

Use `npm run build` to bundle for production or `vsce package` to generate a `.vsix`.

---

## ✅ Requirements

* VS Code 1.90+
* PHP 8.1+
* Laravel 8/9/10 (project root must contain `artisan`)

---

## 📄 License

MIT © [Ali Raza Saleem](https://github.com/ali-raza)

---

## 🙌 Credits

* Symfony Var-Dumper
* Inspired by Laravel's built-in `tinker`
* Extension scaffolded via `yo code`

---

> Want to improve it? PRs welcome. Let’s make Laravel development smoother together.
