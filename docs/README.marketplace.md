# Laravel Playground

**Run Laravel PHP code instantly—right where you write it.**

Skip the terminal. Drop **any PHP file** into `.playground/` folder, hit **Run**, and watch colour‑coded output stream live in the side panel.

---

## Why you’ll love it

* 🖱 **Click ➜ See result** – A friendly **▶ Run** shows up at the top of every playground file.
* ✨ **Instant clarity** – Colour‑coded and live streaming output make it obvious what’s happening.
* 🔍 **Searchable output** – Instantly find variables or values. Matches are auto-highlighted as you type.
* 🛑 **Panic button ready** – Hung script? Hit **Stop**. Done.
* 🎒 **Travels light** – No setup. Just create a file and go.
* 🧘 **Stays out of your way** – Only activates in Laravel projects and sleeps when not in use.
* 💻 **Works anywhere** – Windows, macOS, Linux, WSL, and even remote projects over SSH.

---

## Quick start (60 seconds)

```bash
my‑laravel‑app/
└─ tinker‑playground/
   └─ hello.php
```

```php
<?php
$name = 'VS Code';
"Hello, $name!";
```

1. Save the file. 2. Click **▶ Run** (or press <kbd>Ctrl/⌘ ⇧ R</kbd>). 3. Enjoy the output panel. That’s it.

---

## Demo

Below you can see the flow – create, run, stop, repeat – all in one place.

![Laravel Tinker Runner Demo](https://raw.githubusercontent.com/ali-raza/laravel-tinker-runner/main/.github/demo.gif)

---

## Easily Configurable

| Setting                                | Default             | What it does                                                                            |
| -------------------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `laravelTinkerRunner.playgroundFolder` | `.playground` | Folder that holds runnable php files. Rename if you prefer another location.            |
| `laravelTinkerRunner.appendOutput`     | `true`              | `true` preserves output of previous runs; `false` clears output of previous runs first. |

Find these in **Settings › Extensions › Laravel Tinker Runner**.

---

## Quick answers

| Question                          | Answer                                                                                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Will it touch my DB?*            | Only if your code tells it to. Otherwise it’s read‑only.                                                                                                  |
| *Run on macOS / Linux / Windows?* | Yep – works great on all platforms, including WSL and remote projects over SSH.                                                                           |
| *Got an error?*                   | Open VS Code in the folder with `artisan`, verify `php -v` works. Still stuck? [Open an issue](https://github.com/ali-raza/laravel-tinker-runner/issues). |


---

Liked it? **Star the repo and drop a review** – it helps more devs discover the extension.

Happy tinkering! 🛠️
