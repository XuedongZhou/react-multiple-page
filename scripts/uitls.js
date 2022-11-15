/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require("path");

const resolvePath = (path) => resolve(__dirname, "../", path);

module.exports = {
  resolvePath
};
