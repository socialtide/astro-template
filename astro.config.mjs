// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Update this to your client's domain
  site: "https://your-domain.com",

  // Always use trailing slashes to avoid redirects on Cloudflare
  trailingSlash: "always",

  // Keep HTML whitespace compression (Astro 7 defaults to JSX rules, which drop spaces between inline elements)
  compressHTML: true,

  // Astro Fonts API — self-hosts fonts at build time (no runtime Google Fonts requests)
  fonts: [
    {
      name: "Cormorant Garamond",
      cssVariable: "--font-cormorant-garamond",
      provider: fontProviders.google(),
    },
    {
      name: "Source Sans 3",
      cssVariable: "--font-source-sans-3",
      provider: fontProviders.google(),
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.google(),
    },
  ],

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
