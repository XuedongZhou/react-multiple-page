/* eslint-disable @typescript-eslint/no-var-requires */
const inquirer = require("inquirer");
const execa = require("execa");

const { separator } = require("./constant");
const { entry } = require("./helper");
const { log } = require("./log");

const packagesList = [...Object.keys(entry)];

if (!packagesList.length) {
  log("Package not found, please check `src/packages/**/index.tsx`", "warning");
  return;
}

const allPackagesList = [...packagesList, "all"];

inquirer
  .prompt([
    {
      type: "checkbox",
      message: "Please select the packages:",
      name: "selectedList",
      choices: allPackagesList,
      validate(value) {
        return !value.length ? new Error("Choose at least one package") : true;
      },
      filter(value) {
        if (value.includes("all")) {
          return packagesList;
        }
        return value;
      }
    }
  ])
  .then((res) => {
    const message = `The selected packages: ${res.selectedList.join(", ")}`;
    log(message, "success");
    runParallel(res.selectedList);
  });

async function runParallel(packages) {
  log("\nBuilding...", "success");
  await build(packages);
}

async function build(buildLists) {
  const stringLists = buildLists.join(separator);
  await execa("webpack", ["build", "--mode", "production"], {
    stdio: "inherit",
    env: {
      packages: stringLists
    }
  });
}
