import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    // `npm run deploy` publishes this folder to the gh-pages branch.
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber"],
        },
      },
    },
  },
});
