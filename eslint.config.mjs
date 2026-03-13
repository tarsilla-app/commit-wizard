import js from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { configs } from 'typescript-eslint';

const perfectionistOverrides = {
  'sort-exports': [
    'error',
    {
      order: 'asc',
      type: 'alphabetical',
    },
  ],
  'sort-imports': [
    'error',
    {
      customGroups: [
        {
          elementNamePattern: '@tarsilla(/.*)?$',
          groupName: '@tarsilla',
        },
      ],
      groups: [
        'type-import',
        'value-builtin',
        'value-external',
        '@tarsilla',
        'value-internal',
        ['type-parent', 'type-sibling', 'type-index'],
        ['value-parent', 'value-sibling', 'value-index'],
        'ts-equals-import',
        'unknown',
      ],
      ignoreCase: false,
      newlinesBetween: 1,
      order: 'asc',
      tsconfig: {
        rootDir: '.',
      },
      type: 'alphabetical',
    },
  ],
  'sort-named-exports': [
    'error',
    {
      order: 'asc',
      type: 'alphabetical',
    },
  ],
  'sort-named-imports': [
    'error',
    {
      order: 'asc',
      type: 'alphabetical',
    },
  ],
  'sort-union-types': [
    'error',
    {
      groups: [
        'conditional',
        'function',
        'import',
        'intersection',
        'keyword',
        'literal',
        'named',
        'object',
        'operator',
        'tuple',
        'union',
        'nullish',
      ],
      ignoreCase: false,
      order: 'asc',
      type: 'alphabetical',
    },
  ],
};

function getRules(options) {
  return Object.fromEntries(
    Object.keys(perfectionist.rules).map((rule) => {
      const override = perfectionistOverrides[rule];
      return [`perfectionist/${rule}`, override ?? ['error', options]];
    }),
  );
}

const eslintConfig = defineConfig(
  {
    ignores: ['**/.vscode/', '**/node_modules/', '**/lib/'],
  },
  js.configs.recommended,
  ...configs.strictTypeChecked,
  ...configs.stylisticTypeChecked,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      ...getRules({
        ignoreCase: true,
        order: 'asc',
        specialCharacters: 'trim',
        type: 'alphabetical',
      }),
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        project: true,
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': [
        'error',
        {
          allow: ['/commit-wizard.config\\.json$'],
        },
      ],
      //'no-console': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
        },
      ],
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: true,
        typescript: true,
      },
    },
  },
  {
    extends: [configs.disableTypeChecked],
    files: ['**/*.{cjs,mjs,js,jsx}'],
  },
  prettierRecommended,
  {
    rules: {
      ...prettierRecommended.rules,
      'prettier/prettier': [
        'error',
        {
          jsxSingleQuote: true,
          printWidth: 120,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
        },
        {
          fileInfoOptions: {
            withNodeModules: true,
          },
          usePrettierrc: false,
        },
      ],
    },
  },
);

export default eslintConfig;
