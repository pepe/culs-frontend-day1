import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const reactEntry = fileURLToPath(new URL("./index.html", import.meta.url));
const reactOutput = fileURLToPath(new URL("../herb-profiles", import.meta.url));

export default defineConfig({
  root: projectRoot,
  base: "./",
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^react$/,
        replacement: fileURLToPath(new URL("./node_modules/react/index.js", import.meta.url)),
      },
      {
        find: /^react\/jsx-runtime$/,
        replacement: fileURLToPath(new URL("./node_modules/react/jsx-runtime.js", import.meta.url)),
      },
      {
        find: /^react\/jsx-dev-runtime$/,
        replacement: fileURLToPath(new URL("./node_modules/react/jsx-dev-runtime.js", import.meta.url)),
      },
      {
        find: /^react-dom$/,
        replacement: fileURLToPath(new URL("./node_modules/react-dom/index.js", import.meta.url)),
      },
      {
        find: /^react-dom\/client$/,
        replacement: fileURLToPath(new URL("./node_modules/react-dom/client.js", import.meta.url)),
      },
    ],
  },
  server: {
    fs: {
      allow: [projectRoot],
    },
  },
  build: {
    outDir: reactOutput,
    emptyOutDir: true,
    rollupOptions: {
      input: reactEntry,
    },
  },
});
