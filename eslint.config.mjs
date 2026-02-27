// dittopedia-back/eslint.config.mjs
import sharedConfig from '@dittopedia/shared/eslint-preset';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  ...sharedConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Règles spécifiques au back
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.mjs'],
  },
];
