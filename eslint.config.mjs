import js          from '@eslint/js';
import tsPlugin    from '@typescript-eslint/eslint-plugin';
import tsParser    from '@typescript-eslint/parser';

export default [
  js.configs.recommended,

  /* All TypeScript source (Node context) -------------------- */
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
    plugins:        { '@typescript-eslint': tsPlugin },
    rules: {
      // Generic style / safety
      'semi':                        ['error', 'always'],
      'quotes':                      ['error', 'double'],
      '@typescript-eslint/no-explicit-any': 'warn',
      // Delegate unused-var checking to TS version
      'no-unused-vars':                  'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  /* Web-view front-end files (browser context) -------------- */
  {
    files: ['resources/js/**/*.js'],
    languageOptions: {
      globals: {
        window:            'readonly',
        document:          'readonly',
        navigator:         'readonly',
        console:           'readonly',
        setTimeout:        'readonly',
        clearTimeout:      'readonly',
        acquireVsCodeApi:  'readonly',   // VS Code web-view bridge
      },
    },
    rules: {
      'semi':   ['error', 'always'],
      'quotes': ['error', 'double'],
      'no-unused-vars': 'warn',
    },
  },
];
