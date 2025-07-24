import { defineConfig } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// 在Rollup中，@rollup/plugin-commonjs 插件用于将CommonJS模块（即使用 module.exports 和 require 语法的模块）转换为ES模块（ESM）。
// 由于Rollup是基于ES模块设计的，它只能直接处理ES模块，但在实际开发中，很多npm包（尤其是老旧的包）仍然是CommonJS格式。如果项目中使用了CommonJS模块，Rollup会遇到无法解析依赖的问题，因此需要这个插件来转换这些模块。
import externals from "rollup-plugin-node-externals";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import typescript from "rollup-plugin-typescript2";

export default defineConfig([
  {
    input: {
      index: "src/index.ts", // 打包入口文件
    },
    output: [
      {
        dir: "dist", // 输出目标文件夹
        format: "cjs", // 输出 commonjs 文件
      },
    ],
    cache: false,
    // 这些依赖的作用上文提到过
    plugins: [
      nodeResolve(),
      externals({
        devDeps: false, // 可以识别我们 package.json 中的依赖当作外部依赖处理 不会直接将其中引用的方法打包出来
      }),
      typescript({
        // 禁用缓存
        cacheRoot: false,
      }),
      json(),
      commonjs(),
      terser(),
    ],
  },
]);
