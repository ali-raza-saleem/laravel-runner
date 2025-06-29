# Laravel Playground

**Run Laravel PHP code instantly—right where you write it.**

Drop **any PHP file** into `.playground/` folder, hit **Run** — then search and debug beautifully color-coded output, right in the sidebar.

---

## Why you’ll love it

* ✨ **Colour‑coded output** – Colour‑coded result in the sidebar makes it easily readable.
* 🔍 **Searchable output** – Instantly find variables or values. Matches are auto-highlighted as you type.
* 🛑 **Panic button ready** – Hung script? Hit **Stop**. Done.
* 🎒 **Travels light** – No setup. Just create a file in .playground folder and go.
* 🧘 **Smart Activation** – Only activates in Laravel projects.
* 💻 **Works anywhere** – Windows, macOS, Linux, WSL, and remote SSH supported

---

## Quick start (60 seconds)

You can create your playground manually — or let the extension do it for you.

### 🔧 Option A: Use the built-in **Install Playground** command

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run **Laravel Playground: Install**
3. The extension will create and open a `.playground/hello.php` file for you with a sample snippet.
4. To Run the file, Click **▶ Run PHP File (Laravel Playground)** at the top or simply press `Ctrl+Alt+R` / `Cmd+Alt+R`

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

1. Save the file. 
2. To Run the file, Click **▶ Run PHP File (Laravel Playground)** at the top or simply press `Ctrl+Alt+R` / `Cmd+Alt+R`

---

## Demo

Below you can see the flow – create, run, stop, repeat – all in one place.

![Demo](https://raw.githubusercontent.com/ali-raza-saleem/laravel-playground/main/demo/laravel-playground.gif)

---

## Easily Configurable

| Setting                                | Default       | What it does                                                                            |
| -------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `laravelPlayground.playgroundFolder` | `.playground` | Folder that holds runnable php files. Rename if you prefer another location.            |
| `laravelPlayground.appendOutput`     | `true`        | `true` preserves output of previous runs on new run; `false` clears output of previous runs. |

Find these in **Settings › Extensions › Laravel Playground**.

---

## Quick answers

| Question                          | Answer                                                                                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Will it touch my DB?*            | Only if your code tells it to. Otherwise it’s read‑only.                                                                                                  |
| *Run on macOS / Linux / Windows?* | Yep – works great on all platforms, including WSL and remote projects over SSH.                                                                           |
| *Got an error?*                   | [Open an issue](https://github.com/ali-raza-saleem/laravel-playground/issues). |

---

Liked it? **Star the repo and drop a review** – it helps more devs discover the extension.

Happy tinkering! 🛠️
