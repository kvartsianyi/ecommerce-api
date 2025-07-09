import parser from '@typescript-eslint/parser';
import plugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      ecmaVersion: 'latest',
    },
    plugins: {
      '@typescript-eslint': plugin,
      import: importPlugin,
    },
    rules: {
      ...plugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'no-console': 'warn',
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external', 'internal']],
          'newlines-between': 'always',
        },
      ],
    },
    ignores: ['dist/*', 'node_modules/*'],
  },
];
