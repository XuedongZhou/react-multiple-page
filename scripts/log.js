/* eslint-disable @typescript-eslint/no-var-requires */
const chalk = require("chalk");

const error = chalk.bold.red;
const warning = chalk.hex("#FFA500");
const success = chalk.green;

const maps = {
  success,
  warning,
  error
};

const log = (message, types) => {
  console.log(maps[types](message));
};

module.exports = { log };
