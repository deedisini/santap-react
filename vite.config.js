import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://127.0.0.1:8787" } },
  resolve: { alias: {
    "lucide-react": path.resolve(process.cwd(), "node_modules/lucide-react/dist/cjs/lucide-react.js"),
    "firebase/app": path.resolve(process.cwd(), "node_modules/firebase/app/dist/esm/index.esm.js"),
    "firebase/auth": path.resolve(process.cwd(), "node_modules/firebase/auth/dist/esm/index.esm.js"),
    "firebase/firestore": path.resolve(process.cwd(), "node_modules/firebase/firestore/dist/esm/index.esm.js")
  } }
});
