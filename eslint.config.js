import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    plugins: { '@stylistic': stylistic },
    rules: stylistic.configs.recommended.rules,
  },
];
