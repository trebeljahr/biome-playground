const merge = require("webpack-merge");
const path = require("path");

//https://webpack.js.org/plugins/html-webpack-plugin/
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.resolve(__dirname, "src", "index.html"),
  filename: "index.html",
  inject: "body",
  minify: {
    collapseWhitespace: true,
    minifyCSS: true,
  },
});

// const WebpackCleanupPlugin = require("webpack-cleanup-plugin");
// const WebpackCleanupPluginConfig = new WebpackCleanupPlugin({});

//merge() isn't required, but it enables autocomplete
module.exports = merge({
  entry: path.join(__dirname, "src", "main.ts"),
  output: {
    path: path.join(__dirname, "public"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },

  plugins: [
    // WebpackCleanupPluginConfig,
    HTMLWebpackPluginConfig,
  ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
      {
        test: /\.(gltf|mp3|svg|glb|png|jpe?g)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/[hash][ext][query]",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});
