import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    // `npm run deploy` publishes this folder to the gh-pages branch.
    outDir: "build",
    // three.js (~820 kB) is isolated in the lazily loaded VolSurface chunk, off the critical path.
    chunkSizeWarningLimit: 900,
  },
});
