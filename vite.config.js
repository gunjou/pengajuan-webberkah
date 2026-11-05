import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // opsional: hindari masalah CORS saat development
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000", // ganti ke alamat backend Flask Anda
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
