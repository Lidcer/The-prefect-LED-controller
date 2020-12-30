const path = require("path");
const { DefinePlugin } = require("webpack");
const ManifestPlugin = require("webpack-manifest-plugin");
const { SERVER_PORT, IS_DEV, WEBPACK_PORT } = require("./dist/server/mainServer/main/config.js");

const plugins = [new ManifestPlugin(), new DefinePlugin({ DEV: IS_DEV })];

// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
// plugins.push(new BundleAnalyzerPlugin());

const nodeModulesPath = path.resolve(__dirname, "node_modules");
const targets = IS_DEV ? { chrome: "79", firefox: "72" } : "> 0.25%, not dead";

const config = {
  mode: IS_DEV ? "development" : "production",
  devtool: IS_DEV ? "inline-source-map" : false,
  entry: {
    main: "./src/client",
  },
  output: {
    path: path.join(__dirname, "dist", "statics"),
    filename: `[name]-[hash:8]-bundle.js`,
    publicPath: "/statics/",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  optimization: {
    minimize: !IS_DEV,
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 10,
        },
        material: {
          test: /[\\/]node_modules[\\/]@material-ui[\\/]/,
          name: "material-ui",
          chunks: "all",
          priority: 20,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/, nodeModulesPath],
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/env", { modules: false, targets }], "@babel/react", "@babel/typescript"],
            plugins: [
              "@babel/proposal-numeric-separator",
              "@babel/plugin-transform-runtime",
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
              "@babel/plugin-proposal-object-rest-spread",
            ],
          },
        },
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /.jpe?g$|.gif$|.png$|.svg$|.woff$|.woff2$|.ttf$|.eot$/,
        use: "url-loader?limit=10000",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"],
      },
    ],
  },
  devServer: {
    port: WEBPACK_PORT,
    open: IS_DEV,
    openPage: `http://localhost:${SERVER_PORT}`,
  },
  plugins,
};
module.exports = config;
