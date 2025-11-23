# Astro Website Template

[![Astro](https://img.shields.io/badge/Astro-5.16-orange?style=flat&logo=astro)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-blue?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat&logo=cloudflare)](https://workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

Own your foundation. A production-ready template for agencies and professional services—fast, secure, and designed to be extended.

<img width="2665" height="1881" alt="image" src="https://github.com/user-attachments/assets/cabb0d7d-8074-43f8-b935-5995595243a1" />

## What You Get

- **Beautiful by default** — Warm, elegant design with Cormorant Garamond serif + Source Sans 3
- **One-pager structure** — Hero, Services, About, Testimonial, Process, and Contact sections
- **Blog ready** — Content collections with Markdown, RSS feeds, and related posts
- **SEO optimized** — Meta tags, Open Graph, Twitter cards, JSON-LD schema, sitemaps, and robots.txt
- **Security headers** — CSP, X-Frame-Options, Referrer-Policy configured out of the box
- **Analytics ready** — Optional PostHog integration with event tracking
- **Cloudflare native** — Wrangler config for staging and production deployments
- **Mobile-first** — Responsive design tested across all breakpoints

## Prerequisites

- [Bun](https://bun.sh) — JavaScript runtime and package manager
- [Node.js 18+](https://nodejs.org) — Required by Astro

## Quick Start

```bash
# Clone the repository
git clone https://github.com/socialtide/astro-template my-site
cd my-site

# Remove template git history
rm -rf .git && git init

# Install dependencies
bun install

# Start development server
bun dev
```

Your site is running at `http://localhost:4321`

## Customization

### 1. Update Your Brand

Edit `src/data/site.json`:

```json
{
  "siteName": "Your Brand",
  "siteUrl": "https://yourdomain.com",
  "defaultTitle": "Your Brand | Growing Businesses with Clarity",
  "defaultDescription": "Your compelling description...",
  "contact": {
    "email": "hello@yourdomain.com",
    "phone": "+1 (234) 567-890"
  }
}
```

### 2. Update Navigation

Edit `src/data/navigation.json`:

```json
{
  "logo": { "text": "Your Brand", "href": "/" },
  "mainNav": [
    { "label": "Services", "href": "#services" },
    { "label": "About", "href": "#about" },
    { "label": "Blog", "href": "/blog/" }
  ],
  "ctaButton": { "label": "Get in Touch", "href": "#contact" }
}
```

### 3. Customize Colors

Edit `src/styles/global.css` to change the color palette:

```css
@theme {
  /* Primary - Warm terracotta (or your brand color) */
  --color-primary-500: oklch(0.58 0.14 35);

  /* Accent - Sage green */
  --color-accent-500: oklch(0.55 0.08 145);

  /* Warm neutrals - Cream to charcoal */
  --color-warm-50: oklch(0.985 0.008 85); /* Background */
  --color-warm-900: oklch(0.18 0.015 55); /* Text */
}
```

> Tip: Use [oklch.com](https://oklch.com) to experiment with colors

### 4. Replace Content

- **Homepage sections** — Edit `src/pages/index.astro`
- **Images** — Replace placeholders with your photography
- **Blog posts** — Add Markdown files to `src/content/blog/`

## Project Structure

```
├── src/
│   ├── components/
│   │   └── common/        # Header, Footer
│   ├── content/
│   │   └── blog/          # Blog posts (Markdown)
│   ├── data/              # Site & navigation config
│   ├── layouts/           # Page layouts with SEO
│   ├── pages/             # Routes
│   └── styles/            # Global CSS + Tailwind theme
├── public/                # Static assets
├── astro.config.mjs       # Astro configuration
└── wrangler.toml          # Cloudflare deployment config
```

## Blog Posts

Create Markdown files in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "Brief description for previews and SEO"
author: "Your Name"
date: 2025-01-15
tags: ["business", "strategy"]
featured: true
readingTime: 5
---

Your content here...
```

## Form Handling

The contact form in the template is ready for integration. See [docs/FORM_SETUP.md](./docs/FORM_SETUP.md) for:

- Google Sheets integration via Apps Script
- Custom API endpoints
- Cloudflare Turnstile spam protection

## Analytics

The template includes a privacy-friendly analytics pattern using `data-*` attributes. Add tracking to any element:

```html
<!-- Track CTA clicks -->
<a href="/pricing" data-track-cta="Get Started" data-track-section="hero">
  Get Started
</a>

<!-- Track form interactions (start, progress, submit, abandon) -->
<form data-track-form="contact">...</form>

<!-- Track content engagement (2s dwell time) -->
<section data-track-content="pricing" data-content-type="section">...</section>
```

Works with PostHog out of the box, or adapt to your analytics provider. No cookies required for basic tracking.

## Security

Security headers are configured in `public/_headers` and applied automatically on Cloudflare:

- **Content Security Policy** — Restricts script/style sources, prevents XSS
- **X-Frame-Options: DENY** — Prevents clickjacking
- **X-Content-Type-Options: nosniff** — Prevents MIME sniffing
- **Referrer-Policy** — Controls referrer information
- **Permissions-Policy** — Disables unused browser APIs

The CSP is pre-configured for PostHog, Google Fonts, and Cloudflare analytics. Modify `_headers` if you add other third-party scripts.

## Deployment

### Cloudflare Workers (Recommended)

The template includes staging and production environments out of the box.

1. Update `wrangler.toml` with your project name and domains
2. Deploy:

```bash
bunx wrangler login

# Deploy to staging (preview.yourdomain.com)
bunx wrangler deploy --env staging

# Deploy to production (yourdomain.com)
bunx wrangler deploy --env production
```

Your site is live on Cloudflare's global edge network (300+ locations).

## Commands

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `bun install`   | Install dependencies                 |
| `bun dev`       | Start dev server at `localhost:4321` |
| `bun run build` | Build for production                 |
| `bun preview`   | Preview production build locally     |

## Tech Stack

- [Astro](https://astro.build) — Static site framework
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first CSS with OKLCH colors
- [TypeScript](https://www.typescriptlang.org) — Type safety
- [Cloudflare Workers](https://workers.cloudflare.com) — Edge hosting
- [PostHog](https://posthog.com) — Analytics (optional)

## License

MIT License — see [LICENSE](./LICENSE)

## Credits

Built by [SocialTide](https://socialtide.ai) — helping businesses build digital presences that work.

[Read the why →](https://socialtide.ai/blog/free-astro-template-2025/)

---

**Want us to build your site?** [Get in touch](https://socialtide.ai/free-audit) for a free consultation.
