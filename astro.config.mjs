// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Update this to your client's domain
  site: "https://CLIENT_NAME.socialtide.ai",
  
  // Always use trailing slashes to avoid redirects on Cloudflare
  trailingSlash: "always",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      lastmod: new Date(),
      changefreq: "weekly",
      priority: 0.7,
    }),
  ],
});