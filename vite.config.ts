import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      manifest: {
        name: "PreciBake - Gestão para Confeitaria",
        short_name: "PreciBake",
        description: "Sistema completo de gestão e precificação para confeiteiros",
        theme_color: "#1e293b",
        background_color: "#f5f6fa",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/precibake-icon.png", sizes: "192x192", type: "image/png" },
          { src: "/precibake-icon.png", sizes: "512x512", type: "image/png" },
          { src: "/precibake-icon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
