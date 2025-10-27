const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const webpack = require('webpack');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [
    // Ignore unused database drivers to prevent webpack errors
    new webpack.IgnorePlugin({
      resourceRegExp: /^(pg|pg-query-stream|sqlite3|better-sqlite3|tedious|mysql|oracledb)$/,
      contextRegExp: /knex/,
    }),
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
