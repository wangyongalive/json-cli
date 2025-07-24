import path from "path";
import fs from "fs-extra";
import { gt } from "lodash";
import chalk from "chalk";
import { select, input } from "@inquirer/prompts";
import axios, { AxiosResponse } from "axios";
import { clone } from "../utils/clone";
import { name, version } from "../../package.json";

export interface TemplateInfo {
  name: string; // 项目名称
  downloadUrl: string; // 下载地址
  description: string; // 项目描述
  branch: string; // 项目分支
}
// 这里保存了我写好了咱们的之前开发的模板
export const templates: Map<string, TemplateInfo> = new Map([
  [
    "Vite4-Vue3-Typescript-template",
    {
      name: "admin-template",
      downloadUrl: "git@github.com:wangyongalive/viteVue3.git",
      description: "Vue3技术栈开发模板",
      branch: "main",
    },
  ],
]);

export const getNpmInfo = async (npmName: string) => {
  const npmUrl = `https://registry.npmjs.org/${npmName}`;
  let res = {};
  try {
    console.log("npmUrl", npmUrl);
    res = await axios.get(npmUrl);
  } catch (error) {
    console.error(error);
  }
  console.log("resres", res);
  return res;
};
export const getNpmLatestVersion = async (name: string) => {
  const { data } = (await getNpmInfo(name)) as AxiosResponse;
  console.log("data", data);
  return data["dist-tags"].latest;
};

export const checkVersion = async (name: string, version: string) => {
  console.log(name, version);
  const latestVersion = await getNpmLatestVersion(name);
  const need = gt(latestVersion, version);
  if (need) {
    console.warn(
      `检查到json最新版本： ${chalk.blackBright(
        latestVersion
      )}，当前版本是：${chalk.blackBright(version)}`
    );
    console.log(
      `可使用： ${chalk.yellow(
        "npm install json-cli@latest"
      )}，或者使用：${chalk.yellow("json update")}更新`
    );
  }
  return need;
};

export async function create(prjName?: string) {
  // 我们需要将我们的 map 处理成 @inquirer/prompts select 需要的形式
  // 大家也可以封装成一个方法去处理
  const templateList = [...templates.entries()].map(
    (item: [string, TemplateInfo]) => {
      const [name, info] = item;
      return {
        name,
        value: name,
        description: info.description,
      };
    }
  );
  if (!prjName) {
    prjName = await input({
      message: "请输入项目名称",
    });
  }
  // 构建项目的完整路径
  // path.resolve 将相对路径转换为绝对路径
  // process.cwd() 获取当前命令行的工作目录
  // prjName 是用户输入的项目名称
  const filePath = path.resolve(process.cwd(), prjName);

  // 检查是否已存在同名文件夹
  // fs.existsSync 用于同步检查文件或文件夹是否存在
  if (fs.existsSync(filePath)) {
    // 如果文件夹已存在，弹出交互式选择是否覆盖
    // isOverwrite 方法会显示一个命令行交互，让用户选择是否覆盖
    const run = await isOverwrite(prjName);

    // 根据用户的选择决定是否删除已存在的文件夹
    if (run) {
      // 使用 fs-extra 的 remove 方法安全地删除整个文件夹
      // 比 fs.rmdir 更强大，可以递归删除非空文件夹
      await fs.remove(filePath);
    } else {
      // 如果用户选择不覆盖，中止项目创建流程
      // 这样可以防止意外覆盖用户已存在的项目
      return;
    }
  }

  // 检查版本更新
  await checkVersion(name, version);

  // 选择模板
  const templateName = await select({
    message: "请选择需要初始化的模板:",
    choices: templateList,
  });

  // 下载模板
  const gitRepoInfo = templates.get(templateName);
  if (gitRepoInfo) {
    await clone(gitRepoInfo.downloadUrl, prjName, [
      "-b",
      `${gitRepoInfo.branch}`,
    ]);
  } else {
    // log.error(`${templateName} 模板不存在`);
  }
}

// 处理文件夹冲突的交互方法
// 当创建项目时发现同名文件夹已存在，询问用户是否覆盖
// @param fileName 已存在的文件夹名称
// @returns Promise<boolean> 用户是否选择覆盖
export const isOverwrite = async (fileName: string) => {
  // 在控制台输出警告信息，提醒用户文件夹已存在
  console.warn(`文件 ${fileName} 已存在，是否覆盖？`);

  // 使用 @inquirer/prompts 的 select 方法创建交互式选择
  // 给用户两个选项：覆盖或取消
  return select({
    message: "是否覆盖原文件: ",
    choices: [
      { name: "覆盖", value: true }, // 选择覆盖将删除原文件夹
      { name: "取消", value: false }, // 选择取消中止操作
    ],
  });
};
