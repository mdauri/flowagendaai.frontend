import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    clearMocks: true,
    exclude: [
      ...configDefaults.exclude,
      "e2e/**",
      "playwright/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  server: {
    port: 5173,
  },
});
