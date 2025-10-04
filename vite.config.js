import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "https://api.rose-academy.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ["react-player", "tailwindcss"],
  },
});
