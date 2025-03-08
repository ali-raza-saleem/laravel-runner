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

    $lexer = new \PhpParser\Lexer();
    $parser = new \PhpParser\Parser\Php7($lexer);
    try {
        $ast = $parser->parse($code);
    } catch (\PhpParser\Error $error) {
        throw new \Exception("Parse error: " . $error->getMessage());
    }

    // Remove comments and Nop statements
    $traverser = new \PhpParser\NodeTraverser();
    $traverser->addVisitor(new class extends \PhpParser\NodeVisitorAbstract {
        public function beforeTraverse(array $nodes) {
            // Remove comments from nodes
            foreach ($nodes as $node) {
                $node->setAttribute('comments', []);
            }
            return $nodes;
        }

        public function leaveNode(\PhpParser\Node $node) {
            // Remove Nop statements
            if ($node instanceof \PhpParser\Node\Stmt\Nop) {
                return \PhpParser\NodeTraverser::REMOVE_NODE;
            }
        }
    });

    $ast = $traverser->traverse($ast);

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
