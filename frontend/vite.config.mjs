import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import rewriteAll from "vite-plugin-rewrite-all";

export default defineConfig({
  plugins: [react(), rewriteAll()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://backend:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          clerk: ['@clerk/clerk-react']
        }
      }
    },
  }
});