import js from '@eslint/js';
import imports from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import { config, configs } from 'typescript-eslint';

const eslintConfig = config(
  //ignores
  {
    ignores: ['**/.vscode/', '**/node_modules/', '**/lib/'],
  },
  //all
  js.configs.recommended,
  ...configs.stylistic,
  ...configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
        tsconfigRootDir: './',
      },
      globals: {
        ...globals.builtin,
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  //unused-imports
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  //sort-imports
  {
    rules: {
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],
    },
  },
  //imports
  imports.flatConfigs.recommended,
  imports.flatConfigs.typescript,
  {
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling']],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@tarsilla/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', '@tarsilla'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
  //javascript
  {
    files: ['**/*.{cjs,mjs,js,jsx}'],
    extends: [configs.disableTypeChecked],
  },
  //prettier
  prettierRecommended,
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: true,
          trailingComma: 'all',
          singleQuote: true,
          jsxSingleQuote: true,
          printWidth: 120,
          tabWidth: 2,
        },
        {
          usePrettierrc: false,
          fileInfoOptions: {
            withNodeModules: true,
          },
        },
      ],
    },
  },
);

export default eslintConfig;
