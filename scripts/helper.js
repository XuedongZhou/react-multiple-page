/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { mainFile } = require("./constant");
const { resolvePath } = require("./uitls");

const dirPath = resolvePath("src/packages");

const entry = Object.create(null);

fs.readdirSync(dirPath).filter((file) => {
  const entryPath = path.join(dirPath, file);
  if (fs.statSync(entryPath)) {
    entry[file] = path.join(entryPath, mainFile);
  }
});

const getEntryTemplate = (packages) => {
  const entry = Object.create(null);
  const htmlPlugins = [];
  packages.forEach((packageName) => {
    entry[packageName] = path.join(dirPath, packageName, mainFile);
    htmlPlugins.push(
      new HtmlWebpackPlugin({
        template: resolvePath("public/index.html"),
        filename: `${packageName}.html`,
        chunks: ["manifest", "vendors", packageName]
      })
    );
  });
  return { entry, htmlPlugins };
};

module.exports = {
  entry,
  getEntryTemplate
};
