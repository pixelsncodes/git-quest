import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH lets the same codebase serve from the domain root (subdomain option,
// e.g. gitquest.kaziahmed.net) or from a sub-path (e.g. kaziahmed.net/git-quest/).
// Local dev and the subdomain use "/". For the path option, set BASE_PATH=/git-quest/
// in the Vercel project's Environment Variables.
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5173, open: true },
});
