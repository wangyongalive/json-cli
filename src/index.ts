/**es6语法 */
import { Command } from "commander";
import { version } from "../package.json";
import create from "./command/create";
const program = new Command("json-cli");
program.version(version, "-v, --version", "output the current version");

program
  .command("create")
  .description("create a new project")
  .argument("[name]", "project name")
  .action((name) => {
    create(name);
  });
program.parse();
