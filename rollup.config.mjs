import { resolve } from "path";

import { babel } from '@rollup/plugin-babel';
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: "output/standalone.js",
    format: 'umd',
    name: 'prettierPlugins.apex',
    exports: 'named',
    globals: {
      prettier: 'prettier',
      axios: 'axios'
    },
    paths: {
      prettier: 'prettier/standalone',
      axios: 'node_modules/axios/dist/browser/axios.cjs'
    }
  },
  external: ["prettier", "axios"],
  plugins: [
    // builtins(),
    // globals(),
    nodeResolve({
      browser: true,
      preferBuiltins: true
    }),
    json(),
    commonjs(),
    nodePolyfills(),
    typescript({
      tsconfig: 'tsconfig.prod.json'
    }),
    babel({
      babelrc: false,
      extensions: [".ts", ".js"],
      include: resolve("src", "**", "*"),
      plugins: [],
      compact: false,
      presets: [
        // [
        //   require.resolve("@babel/preset-env"),
        //   {
        //     targets: { browsers: [">0.25%", "not ie 11", "not op_mini all"] },
        //     modules: false,
        //   },
        // ],
      ],
    })
  ]
};
