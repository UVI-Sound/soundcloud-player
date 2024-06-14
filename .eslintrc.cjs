module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: 'standard-with-typescript',
    overrides: [
        {
            env: {
                node: true,
            },
            files: ['.eslintrc.{js,cjs}'],
            parserOptions: {
                sourceType: 'script',
            },
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        '@typescript-eslint/no-extraneous-class': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/semi': 'off',
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/space-before-function-paren': 'off',
        '@typescript-eslint/member-delimiter-style': 'off',
        indent: 'off',
    },
};
