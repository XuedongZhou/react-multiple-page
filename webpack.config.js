/* eslint-disable @typescript-eslint/no-var-requires */
const { existsSync } = require("fs");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const { generatePort } = require("./scripts/generatePort");
const { resolvePath } = require("./scripts/uitls");
const { separator } = require("./scripts/constant");
const { getEntryTemplate } = require("./scripts/helper");

const packages = process.env.packages.split(separator);
const { entry, htmlPlugins } = getEntryTemplate(packages);

module.exports = async (env, options) => {
  const isProduction = options.mode === "production";
  const isDevelopment = options.mode === "development";

  const isDevServer = !!env.WEBPACK_SERVE;
  const useSourceMap = !!env.SOURCE_MAP;

  const dotenvFilePath = resolvePath(`./.env.${options.mode}`);

  const config = {
    mode: isProduction ? "production" : "development",
    bail: isProduction,
    devtool: isProduction ? (useSourceMap ? "source-map" : false) : isDevelopment && "cheap-module-source-map",
    entry,
    output: {
      publicPath: "/",
      filename: isProduction ? "js/[name].[contenthash:8].js" : isDevelopment && "js/[name].bundle.js",
      chunkFilename: isProduction ? "js/[name].[contenthash:8].chunk.js" : isDevelopment && "js/[name].chunk.js",
      clean: true
    },
    resolve: {
      alias: {
        "@": resolvePath("src")
      },
      mainFiles: ["index", "main"],
      extensions: [".js", "jsx", ".ts", ".tsx", ".json"]
    },
    cache: {
      type: "filesystem"
    },
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /node_modules/,
            name: "vendors",
            minChunks: 1,
            chunks: "initial",
            minSize: 0,
            priority: 1
          },
          commons: {
            name: "commons",
            minChunks: 2,
            chunks: "initial",
            minSize: 0
          }
        }
      }
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new Dotenv({
        path: existsSync(dotenvFilePath) ? dotenvFilePath : resolvePath("./.env")
      }),
      new ESLintPlugin({
        extensions: ["js", "jsx", "ts", "tsx"],
        threads: true
      }),
      new ForkTsCheckerWebpackPlugin({
        async: isDevelopment,
        typescript: {
          mode: "write-references"
        }
      }),
      ...htmlPlugins,
      isProduction &&
        new MiniCssExtractPlugin({
          filename: "css/[name].[contenthash:8].css"
        }),
      isDevServer && new ReactRefreshWebpackPlugin()
    ].filter(Boolean),
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /.(jsx?|tsx?)$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: "babel-loader",
                  options: {
                    presets: [
                      [
                        "@babel/preset-env",
                        {
                          useBuiltIns: "usage",
                          corejs: { version: 3 }
                        }
                      ],
                      ["@babel/preset-react", { runtime: "automatic" }],
                      "@babel/preset-typescript"
                    ],
                    plugins: [["@babel/plugin-transform-runtime"], isDevServer && require.resolve("react-refresh/babel")].filter(Boolean)
                  }
                }
              ]
            },
            {
              test: /.(sc|sa)ss$/,
              use: [
                isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
                "css-loader",
                {
                  loader: "postcss-loader",
                  options: {
                    sourceMap: isDevelopment,
                    postcssOptions: {
                      plugins: [isProduction && require.resolve("autoprefixer")].filter(Boolean)
                    }
                  }
                },
                {
                  loader: "sass-loader",
                  options: {
                    sourceMap: true
                  }
                }
              ].filter(Boolean)
            },
            {
              test: /\.(png|jpe?g|svg|gif)$/,
              type: "asset",
              generator: {
                filename: "images/[name].[contenthash:6][ext]"
              },
              parser: {
                dataUrlCondition: {
                  maxSize: 2 * 1024
                }
              }
            },
            {
              test: /\.(eot|ttf|woff|woff2)$/,
              type: "asset",
              generator: {
                filename: "fonts/[name].[contenthash:6][ext]"
              },
              parser: {
                dataUrlCondition: {
                  maxSize: 2 * 1024
                }
              }
            },
            {
              test: /.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
              type: "asset/resource",
              generator: {
                filename: "media/[name].[contenthash:6][ext]"
              }
            }
          ]
        }
      ]
    }
  };

  const port = await generatePort();

  const devServer = {
    hot: true,
    port,
    static: {
      directory: resolvePath("public")
    }
  };

  return isDevServer ? { ...config, devServer } : config;
};
