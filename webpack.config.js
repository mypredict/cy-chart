const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
// const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin')

module.exports = {
  mode: 'development',
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 100,
    poll: 1000
  },
  entry: './src/index.js',
  output: {
    filename: 'cy-chart.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new htmlWebpackPlugin({
      template: 'index.html'
    })
    // new HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    // hot: true,
    port: 8080
  }
}
