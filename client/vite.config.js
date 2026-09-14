import process from "node:process";

import {
  defineConfig,
  loadEnv,
} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(
    mode,
    process.cwd(),
    ""
  );

  const apiUrl =
    process.env.VITE_API_URL ||
    env.VITE_API_URL;

  if (
    mode === "production" &&
    !apiUrl?.trim()
  ) {
    throw new Error(
      "VITE_API_URL is required for production builds."
    );
  }

  return {
    plugins: [react()],

    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
    },
  };
});
