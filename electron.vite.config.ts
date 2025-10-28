import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
//import { visualizer } from 'rollup-plugin-visualizer'
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

const hasInt = fs.existsSync(resolve("src/main/int"));

const intAlias = hasInt
  ? {
      main: resolve("src/main/int/index.ts"),
      renderer: resolve("src/renderer/int/index.ts"),
    }
  : {
      main: resolve("src/main/adapters/stubs.ts"),
      renderer: resolve("src/renderer/adapters/stubs.tsx"),
    };

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ["@react-pdf/renderer", "@react-email/render"],
      }),
      //visualizer({ filename: 'dist/stats/stats-main.html', open: false })
    ],
    define: {
      HAS_INT_FEATURES: hasInt,
    },
    resolve: {
      alias: {
        "@shared": resolve("src/shared"),
        "@main": resolve("src/main"),
        "@core-windows": resolve("src/main/core/windows"),
        "@core-utils": resolve("src/main/core/utils"),
        "@core-logger": resolve("src/main/core/utils/logger"),
        "@resources": resolve("resources"),
        "@adapter": resolve("src/main/adapters"),
        "@int": intAlias.main,
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve("src/main/index.ts"),
          renderWorker: resolve("src/main/core/render/renderWorker.ts"),
        },
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "@shared": resolve(__dirname, "src/shared"),
      },
    },
    plugins: [
      externalizeDepsPlugin(),
      //visualizer({ filename: 'dist/stats/stats-preload.html', open: false })
    ],
    build: {
      rollupOptions: {
        input: {
          "dash-preload": resolve(
            __dirname,
            "src/preload/core/dash-preload.ts"
          ),
          "editor-preload": resolve(
            __dirname,
            "src/preload/core/editor-preload.ts"
          ),
          "send-preload": resolve(
            __dirname,
            "src/preload/core/send-preload.ts"
          ),
          "onboarding-preload": resolve(
            __dirname,
            "src/preload/core/onboarding-preload.ts"
          ),
          "error-preload": resolve(
            __dirname,
            "src/preload/core/error-preload.ts"
          ),
        },
      },
    },
  },
  renderer: {
    worker: {
      format: "es",
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/core/src"),
        "@core": resolve("src/renderer/core/src"),
        "@components": resolve(__dirname, "src/renderer/core/src/components"),
        "@core-components": resolve(
          __dirname,
          "src/renderer/core/src/components"
        ),
        "@shared": resolve("src/shared"),
        "@workers": resolve("src/renderer/core/src/workers"),
        "@node_modules": resolve("node_modules"),
        "@adapters": resolve("src/renderer/adapters"),
        "@int": intAlias.renderer,
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      //visualizer({ filename: 'dist/stats/stats-renderer.html', open: false })
    ],
    build: {
      rollupOptions: {
        input: {
          mainWindow: resolve(__dirname, "src/renderer/core/index.html"),
          editorWindow: resolve(__dirname, "src/renderer/core/editor.html"),
          sendWindow: resolve(__dirname, "src/renderer/core/send.html"),
          onboardWindow: resolve(
            __dirname,
            "src/renderer/core/onboarding.html"
          ),
          errorWindow: resolve(__dirname, "src/renderer/core/error.html"),
        },
      },
    },
  },
});
