module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  parser: '@babel/eslint-parser',
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',

    'react/destructuring-assignment': ['error', 'always'],
    'react/display-name': 'off',
    'react/jsx-pascal-case': 'error',
    'react/no-unknown-property': 'error',
    'react/prop-types': 'off',
    'react/jsx-boolean-value': 'error',
    'react/jsx-fragments': 'error',
    'react/jsx-sort-props': 'off',
    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: false,
      },
    ],

    // react-hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
