<?php

use App\Models\User;

// Play with this file to see how it works
// You can run it by clicking the "Run PHP File" at the top of this file or just do Ctrl+Alt+R

$name = 'Laravel Playground';
$features = [
    'colour‑coded output'  => 'makes results easily readable at a glance',
    'searchable output'    => 'highlighted matches as you type',
    'stop on demand'       => 'panic button halts long-running scripts',
    'smart activation'     => 'only loads in Laravel projects',
    'cross‑platform'       => 'works on Windows, macOS, Linux, WSL, SSH… anywhere',
];


// Anything returned from the last expression is pretty-printed for you
return [
    'message'  => "Hello, $name! 🚀",
    'features' => $features,
    'now'      => now()->toDateTimeString(),
];

// You can also use Eloquent models, like this:
// User::first();
