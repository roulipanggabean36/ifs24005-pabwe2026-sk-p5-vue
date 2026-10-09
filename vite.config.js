import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Menyisipkan CSS utama langsung ke index.html agar tidak memblokir render
function inlineEntryCss() {
  return {
    name: "inline-entry-css",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        return html.replace(
          /<link rel="stylesheet"[^>]*?href="([^"]+\.css)"[^>]*>/g,
          (tag, href) => {
            const file = bundle[href.replace(/^\//, "")];
            if (!file || file.type !== "asset") return tag;
            const css =
              typeof file.source === "string"
                ? file.source
                : new TextDecoder().decode(file.source);
            return "<style>" + css + "</style>";
          }
        );
      },
    },
  };
}
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.APP_PORT) || 3000;

  return {
    plugins: [vue(), tailwindcss(), inlineEntryCss()],
    build: { sourcemap: true, target: "esnext" },
    server: { port },
    preview: { port },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,vue}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});