import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Make sure path is imported

export default defineConfig({
  plugins: [react()],
  // Change base from '' or relative paths to '/' or use path.resolve if needed
  base: "/",
  resolve: {
    alias: {
      // Ensure aliases use absolute paths with path.resolve
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
});
