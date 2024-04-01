import path from "path";
import { fileURLToPath } from "node:url";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageName = "user-interaction-js";

export default defineConfig({
  build: {
    target: "ES2020",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: packageName,
      formats: ["es", "cjs"],
      fileName: (format) => `${packageName}.${format === "es" ? "mjs" : "cjs"}`,
    },
    minify: "terser",
  },
  plugins: [
    dts({
      outDir: "dist",
      entryRoot: "src",
      insertTypesEntry: true,
    }),
  ],
});
