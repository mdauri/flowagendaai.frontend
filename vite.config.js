import fs from "node:fs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { configDefaults } from "vitest/config";
function resolveHttpsConfig(mode) {
    const env = loadEnv(mode, process.cwd(), "");
    const httpsEnabled = env.VITE_DEV_HTTPS === "true";
    if (!httpsEnabled) {
        return undefined;
    }
    const keyPath = env.VITE_DEV_HTTPS_KEY_PATH?.trim();
    const certPath = env.VITE_DEV_HTTPS_CERT_PATH?.trim();
    if (!keyPath || !certPath) {
        throw new Error("VITE_DEV_HTTPS=true exige VITE_DEV_HTTPS_KEY_PATH e VITE_DEV_HTTPS_CERT_PATH apontando para os arquivos do certificado local.");
    }
    const resolvedKeyPath = path.resolve(process.cwd(), keyPath);
    const resolvedCertPath = path.resolve(process.cwd(), certPath);
    if (!fs.existsSync(resolvedKeyPath) || !fs.existsSync(resolvedCertPath)) {
        throw new Error(`Certificado HTTPS local nao encontrado. key=${resolvedKeyPath} cert=${resolvedCertPath}`);
    }
    return {
        key: fs.readFileSync(resolvedKeyPath),
        cert: fs.readFileSync(resolvedCertPath),
    };
}
export default defineConfig(({ mode }) => ({
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
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json-summary"],
            reportsDirectory: "./coverage",
            exclude: [
                "src/test/**",
                "**/*.test.ts",
                "**/*.test.tsx",
            ],
        },
        exclude: [
            ...configDefaults.exclude,
            "e2e/**",
            "playwright/**",
            "playwright-report/**",
            "test-results/**",
        ],
    },
    server: {
        host: "localhost",
        port: 5173,
        https: resolveHttpsConfig(mode),
    },
}));
