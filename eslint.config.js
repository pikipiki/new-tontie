import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import sonarjs from 'eslint-plugin-sonarjs'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'public',
      'reference',
      '.cache',
      'scripts/mesh-pipeline/.venv',
      'coverage/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.eslint.json', './tsconfig.test.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      sonarjs,
    },
    rules: {
      ...sonarjs.configs.recommended.rules,
      'sonarjs/prefer-read-only-props': 'off',
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      /** Meaningful names only — no 1–2 letter variables (object keys exempt). */
      'id-length': [
        'error',
        {
          min: 3,
          properties: 'never',
          exceptions: ['_'],
        },
      ],
      'max-lines': [
        'error',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        {
          max: 80,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
    },
  },
  {
    files: ['vite.config.ts', 'eslint.config.js'],
    rules: { 'id-length': 'off' },
  },
  {
    files: ['src/game/audioInternal.ts'],
    rules: { 'max-lines': 'off' },
  },
  {
    files: [
      'src/**/__tests__/**/*.{ts,tsx}',
      'tests/**/*.{ts,tsx}',
      '**/*.test.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: [
      'src/game/__tests__/audio/audioInternal.*.test.ts',
      'src/game/__tests__/helpers/audioInternal.harness.ts',
    ],
    rules: {
      'sonarjs/assertions-in-tests': 'off',
      'sonarjs/public-static-readonly': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'sonarjs/no-floating-point-equality': 'off',
      'sonarjs/public-static-readonly': 'off',
    },
  },
  {
    files: ['src/hooks/useTontieGameSession.ts'],
    rules: { 'sonarjs/pseudo-random': 'off' },
  },
  eslintConfigPrettier,
)
