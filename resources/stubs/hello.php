<?php

use App\Models\User;

echo "✨  WELCOME TO LARAVEL PLAYGROUND!…\n";

// Play with this file to see how it works
// You can run it by clicking the "Run PHP File" at the top of this file or just do Ctrl+Alt+R

$name = 'Laravel Playground';
$features = [
    'streaming'  => 'live colour-coded output',
    'stop'       => 'panic button ready',
    'append'     => 'stack runs like console history',
];


// Anything returned from the last expression is pretty-printed for you
return [
    'message'  => "Hello, $name! 🚀",
    'features' => $features,
    'now'      => now()->toDateTimeString(),
];

// You can also use Eloquent models, like this:
// User::first();
