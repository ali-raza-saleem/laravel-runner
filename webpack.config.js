const path = require("path");
const glob = require("glob");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = [
  // **1️⃣ Webpack Configuration for the VS Code Extension**
  {
    entry: {
      extension: path.resolve(__dirname, "src/extension.ts"), // Absolute path for extension.ts
    },
    output: {
      filename: "extension.min.js",
      path: path.resolve(__dirname, "dist"), // ✅ Separate folder for extension files
      libraryTarget: "commonjs2",
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    target: "node",
    mode: "production",
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    externals: {
      vscode: "commonjs vscode", // Prevent Webpack from bundling the vscode module
    },
  },

  // **2️⃣ Webpack Configuration for the WebView App (JavaScript & CSS)**
  {
    entry: {
      app: [
        ...glob.sync("./resources/js/**/*.js").map(file => path.resolve(__dirname, file)), // Combines all JS files
        "./resources/css/app.css",
      ],
    },
    output: {
      filename: "app.min.js",
      path: path.resolve(__dirname, "dist"), // ✅ Separate folder for WebView files
    },
    resolve: {
      extensions: [".ts", ".js", ".css"],
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },
    mode: "production",
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "../dist/app.min.css", // ✅ CSS goes to dist/css/
      }),
    ],
  },
];
