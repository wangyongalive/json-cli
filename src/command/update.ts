import process from "child_process";
import chalk from "chalk";
import ora from "ora";

const spinner = ora({
  text: "yong0102-cli 正在更新....",
  spinner: {
    interval: 300,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"].map((item) =>
      chalk.blue(item)
    ),
  },
});
export function update() {
  spinner.start();
  process.exec("npm install yong0102-cli@latest -g", (error) => {
    spinner.stop();
    if (!error) {
      console.log(chalk.green("更新成功"));
    } else {
      console.log(chalk.red(error));
    }
  });
}
