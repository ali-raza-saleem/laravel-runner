<?php

use App\Models\User;

// Play with this file to see how it works
// You can run it by clicking the "Run PHP File" at the top of this file or just do Ctrl+Alt+R

$name = 'Laravel Runner';
$features = [
    'colour‑coded output'  => 'readable at a glance',
    'searchable output'    => 'highlights as you type',
    'stop on demand'       => 'halt scripts instantly',
    'smart activation'     => 'only in Laravel projects',
    'cross‑platform'       => 'works everywhere',
];


// Anything returned from the last expression is pretty-printed for you
return [
    'message'  => "Hello, $name! 🚀",
    'features' => $features,
    'now'      => now()->toDateTimeString(),
];

// You can also use Eloquent models, like this:
// User::first();
