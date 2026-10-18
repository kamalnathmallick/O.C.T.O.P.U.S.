const nextConfig = require('eslint-config-next');

module.exports = [
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  ...nextConfig,
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];