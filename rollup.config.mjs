import { nodeResolve } from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-polyfill-node";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const production = process.env.NODE_ENV === "production";

const extensions = [".js", ".ts", ".tsx"];

export default [
    {
        input: {
            "dist/main": "src/main.ts",
            "dist/worker": "src/worker.ts",
            "dist/zip": "src/zip.ts",
        },
        output: {
            dir: "lib",
            format: "es",
            sourcemap: true,
        },
        preserveEntrySignatures: false,
        plugins: [
            nodePolyfills(),
            nodeResolve({
                extensions,
            }),
            typescript()
            // terser()
        ],
    },
];
