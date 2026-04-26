import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Para GitHub Pages en repositorio: base: "/NOMBRE_REPO/"
  // Para dominio personalizado (ej. costos.star-app.com.ar): base: "/"
  base: "/",
});
