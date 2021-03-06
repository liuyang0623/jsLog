const TerserPlugin = require("terser-webpack-plugin");
var LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {
  entry: {
    js4Log: "./src/js4Log.js",
    index: "./src/js4Log.js",
  },
  output: {
    library: "js4Log",
    libraryExport: "default",
    libraryTarget: "umd",
    filename: "[name].js",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            // drop_console: true,
          },
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  plugins: [new LodashModuleReplacementPlugin()],
};
