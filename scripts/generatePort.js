/* eslint-disable @typescript-eslint/no-var-requires */
const portFinder = require("portfinder");

const { port } = require("./constant");

const generatePort = async () => {
  try {
    portFinder.basePort = port;
    return await portFinder.getPortPromise();
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = { generatePort };
