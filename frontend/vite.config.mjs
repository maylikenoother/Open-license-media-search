import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pluginRewriteAll from 'vite-plugin-rewrite-all';

export default defineConfig({
  plugins: [react(),pluginRewriteAll],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      "/auth": "http://localhost:8000",
      "/users": "http://localhost:8000"
    },
  },
});
