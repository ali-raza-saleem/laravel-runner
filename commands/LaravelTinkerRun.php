<?php

namespace App\Console\Commands\LaravelTinkerRunner;

use Illuminate\Console\Command;

class LaravelTinkerRun extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'laravel-tinker:run {file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute a PHP file inside Laravel’s context and return output like Tinkerwell';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $file = $this->argument('file');
        $filePath = base_path($file);

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        try {
            // Capture any output (from echo, print, etc.)
            ob_start();

            // Evaluate the PHP file with auto-return transformation in the global scope.
            $lastOutput = $this->evaluatePhpFile($filePath);

            // Get buffered output (from echo, print, etc.)
            $bufferedOutput = ob_get_clean();

            // Display buffered output first (if any)
            if (!empty($bufferedOutput)) {
                $this->line($bufferedOutput);
            }

            // Display the result from the evaluated file, pretty-formatted.
            if (!is_null($lastOutput)) {
                $this->line($this->prettyPrint($lastOutput));
            }

            return 0;
        } catch (\Throwable $e) {
            $this->error("Error executing file: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Evaluate a PHP file and auto-wrap its last expression in a return statement.
     *
     * @param string $filePath
     * @return mixed
     */
    protected function evaluatePhpFile($filePath)
    {
        $code = file_get_contents($filePath);
        // Remove the opening PHP tag if present.
        $code = preg_replace('/^<\?php\s*/', '', $code);

        // Transform the code to ensure the last expression is returned.
        $transformedCode = $this->transformCode($code);

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
    protected function transformCode($code)
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
    protected function prettyPrint($value)
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
}
