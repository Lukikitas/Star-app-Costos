import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoBase = "/Star-app-Costos/";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages en repositorio (https://usuario.github.io/NOMBRE_REPO/): usar `repoBase`.
  // Dominio personalizado (https://costos.star-app.com.ar/): cambiar `base` a "/".
  base: process.env.USE_CUSTOM_DOMAIN === "true" ? "/" : repoBase,
});
