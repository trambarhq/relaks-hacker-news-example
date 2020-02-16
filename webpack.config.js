const Path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const event = process.env.npm_lifecycle_event;

module.exports = {
  mode: (event === 'build') ? 'production' : 'development',
  context: Path.resolve('./src'),
  entry: './main',
  output: {
    path: Path.resolve('./www'),
    filename: 'front-end.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: [
            '@babel/env',
            '@babel/react',
          ],
          plugins: [
            '@babel/proposal-class-properties',
            '@babel/transform-runtime',
          ]
        }
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.(jpeg|jpg|png|gif)$/,
        loader: 'file-loader',
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: Path.resolve(`./src/index.html`),
      filename: Path.resolve(`./www/index.html`),
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: (event === 'build') ? 'static' : 'disabled',
      reportFilename: `report.html`,
    }),
  ],
  optimization: {
    concatenateModules: false,
  },
  devtool: (event === 'build') ? 'source-map' : 'inline-source-map',
  devServer: {
    inline: true,
    open: true,
  }
};
