import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Worker PDF.js diberi ekstensi .js: banyak server mengirim .mjs dengan
        // MIME yang salah, sehingga browser menolaknya dan pratinjau PDF gagal.
        assetFileNames: ({ names }) =>
          names.some((name) => name.endsWith(".mjs"))
            ? "assets/[name]-[hash].js"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
});
