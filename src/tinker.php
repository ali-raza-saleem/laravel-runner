#!/usr/bin/env php
<?php

use Illuminate\Contracts\Console\Kernel;

define('LARAVEL_START', microtime(true));

// Assuming we are in vendor/ali-raza-saleem/laravel-tinker-runner directory
$larvalRootDirectory = __DIR__ . '/../../..';

require $larvalRootDirectory . '/vendor/autoload.php';

// Boot the Laravel application
$app = require_once $larvalRootDirectory . '/bootstrap/app.php';

// Run Laravel's Kernel
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();


// Get the file argument
$file = $argv[1] ?? null;

if (!$file) {
    die("Usage: php myscript.php <script-file>\n");
}

$filePath = base_path($file);

if (!file_exists($filePath)) {
    die("File not found: {$filePath}\n");
}

try {
    // Capture any output (from echo, print, etc.)
    ob_start();

    // Evaluate the PHP file with auto-return transformation in the global scope.
    $lastOutput = evaluatePhpFile($filePath);

    // Get buffered output (from echo, print, etc.)
    $bufferedOutput = ob_get_clean();

    // Display buffered output first (if any)
    if (!empty($bufferedOutput)) {
        echo $bufferedOutput . "\n";
    }

    // Display the result from the evaluated file, pretty-formatted.
    if (!is_null($lastOutput)) {
        echo prettyPrint($lastOutput) . "\n";
    }

    exit(0);
} catch (\Throwable $e) {
    die("Error executing file: " . $e->getMessage() . "\n");
}


function evaluatePhpFile($filePath)
{
    $code = file_get_contents($filePath);
    // Remove the opening PHP tag if present.
    $code = preg_replace('/^<\?php\s*/', '', $code);

    // Transform the code to ensure the last expression is returned.
    $transformedCode = transformCode($code);

    // Execute the transformed code in the global scope.
    return eval($transformedCode);
}

/**
 * Transform the code by inserting a return statement before the final expression,
 * if the last statement is an expression.
 *
 * @param string $code
 * @return string Transformed PHP code ready for eval.
 */
function transformCode($code)
{
    // Remove the opening PHP tag.
    $code = preg_replace('/^<\?php\s*/', '', $code);

    // Remove comments (since you don't care if they're removed).
    $code = preg_replace([
        '/\/\/.*$/m',
        '/\/\*.*?\*\//s'
    ], '', $code);

    $lexer = new \PhpParser\Lexer();
    $parser = new \PhpParser\Parser\Php7($lexer);
    try {
        $ast = $parser->parse($code);
    } catch (\PhpParser\Error $error) {
        throw new \Exception("Parse error: " . $error->getMessage());
    }

    // If there are statements, check the last one.
    if (!empty($ast)) {
        $lastIndex = count($ast) - 1;
        $lastStmt = $ast[$lastIndex];

        // If the last statement is an expression (and not already a return), replace it with a return statement.
        if ($lastStmt instanceof \PhpParser\Node\Stmt\Expression) {
            $ast[$lastIndex] = new \PhpParser\Node\Stmt\Return_($lastStmt->expr, $lastStmt->getAttributes());
        }
    }

    $printer = new \PhpParser\PrettyPrinter\Standard();
    $transformedCode = $printer->prettyPrintFile($ast);
    // Remove the PHP opening tag that prettyPrintFile() adds.
    $transformedCode = preg_replace('/^<\?php\s*/', '', $transformedCode);

    // Fallback: Check only the last non-empty line.
    // Fallback: If the transformed code doesn't start with "return", force it.
    $lines = explode("\n", $transformedCode);
    $lastNonEmptyLine = null;
    $lastNonEmptyIndex = null;
    for ($i = count($lines) - 1; $i >= 0; $i--) {
        if (trim($lines[$i]) !== '') {
            $lastNonEmptyLine = trim($lines[$i]);
            $lastNonEmptyIndex = $i;
            break;
        }
    }
    // Only prepend "return" if the last nonempty line doesn't start with "return", "echo", or "print".
    if ($lastNonEmptyLine !== null && !preg_match('/^(return|echo|print)\b/i', $lastNonEmptyLine)) {
        $lines[$lastNonEmptyIndex] = 'return ' . $lines[$lastNonEmptyIndex];
        $transformedCode = implode("\n", $lines);
    }


    return $transformedCode;
}


/**
 * Format the output in a pretty way.
 *
 * @param mixed $value
 * @return string
 */
function prettyPrint($value)
{
    // If the value is an Eloquent model, use Symfony VarDumper.
    if ($value instanceof \Illuminate\Database\Eloquent\Model) {
        // Capture the output of VarDumper.
        ob_start();
        \Symfony\Component\VarDumper\VarDumper::dump($value);
        return ob_get_clean();
    }

    // For arrays or generic objects, try pretty-printing as JSON.
    if (is_array($value) || is_object($value)) {
        $json = json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        if ($json !== false) {
            return $json;
        }
    }

    // For scalar types, fallback to print_r.
    return print_r($value, true);
}
