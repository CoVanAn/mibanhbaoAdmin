import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/// <reference types="vite/client" />

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
