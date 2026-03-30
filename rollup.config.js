import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
    input: "./index.js",
    output: {
        esModule: true,
        dir: "dist/",
        format: "es",
        sourcemap: true,
    },
    plugins: [commonjs(), nodeResolve({ preferBuiltins: true })],
};

export default config;
