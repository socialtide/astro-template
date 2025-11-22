# SocialTide Client Website Template

A modern, production-ready template for creating client websites with Astro, Tailwind CSS v4, and Cloudflare deployment. Built by SocialTide for rapid client onboarding with best practices baked in.

## 🌟 Features

- **Astro 5.12+** - Lightning-fast static site generation
- **Tailwind CSS v4** - Modern CSS-first configuration with custom theme
- **Typography Plugin** - Beautiful prose styles out of the box
- **SEO Optimized** - Comprehensive meta tags, sitemap, and structured data
- **Blog System** - Full-featured blog with tags, RSS feed, and content collections
- **Responsive Design** - Mobile-first with tested breakpoints
- **Form Handling** - Multiple integration options (Google Sheets, API, Turnstile)
- **Newsletter-Ready** - Drop-in subscribe form powered by harbor.socialtide.ai
- **PostHog Analytics** - Optional PostHog snippet with automatic CTA, form, and content tracking
- **Cloudflare Ready** - One-click deployment with Wrangler configuration
- **Component Library** - Pre-built sections for quick assembly

## 📋 Prerequisites

- **Node.js 18+** (check with `node --version`)
- **Bun** package manager ([install](https://bun.sh/))
- **Git** for version control
- **Cloudflare account** for deployment (free tier works)

## 🚀 Quick Start

### 1. Create New Project from Template

```bash
# Clone the template
git clone https://github.com/socialtide/astro-template.git client-name
cd client-name

# Remove template git history
rm -rf .git
git init

# Install dependencies
bun install
```

### 2. Configure for Your Client

Update these files with client information:

- Copy `.env.example` to `.env` and configure any required environment variables (PostHog key, Turnstile site key, form endpoints).

**`package.json`**

```json
{
  "name": "client-name",
  ...
}
```

**`wrangler.toml`**

```toml
name = "client-name"
routes = [
  { pattern = "client-name.socialtide.ai", custom_domain = false },
]
```

**`astro.config.mjs`**

```js
export default defineConfig({
  site: "https://client-name.socialtide.ai",
  ...
});
```

**`src/data/site.json`**

```json
{
  "siteName": "Client Name",
  "siteUrl": "https://client-name.socialtide.ai",
  "defaultTitle": "Client Name | Professional Services",
  ...
}
```

### 3. Start Development

```bash
# Run development server
bun dev

# Open http://localhost:4321
```

## 🎨 Customization Guide

### Brand Colors (Tailwind v4)

Edit `src/styles/global.css` to update brand colors using OKLCH color space:

```css
@theme {
  /* Primary colors - Update these values */
  --color-primary-50: oklch(0.97 0.02 155);
  --color-primary-100: oklch(0.95 0.04 155);
  --color-primary-200: oklch(0.91 0.08 155);
  --color-primary-300: oklch(0.84 0.12 155);
  --color-primary-400: oklch(0.73 0.16 155);
  --color-primary-500: oklch(0.62 0.17 155);
  --color-primary-600: oklch(0.53 0.15 155);
  --color-primary-700: oklch(0.44 0.12 155);
  --color-primary-800: oklch(0.37 0.1 155);
  --color-primary-900: oklch(0.3 0.08 155);
  --color-primary-950: oklch(0.2 0.05 155);
}
```

> **Tip**: Use [oklch.com](https://oklch.com) to generate color values

### Typography

The template includes the Tailwind Typography plugin. Use it with:

```html
<div class="prose prose-lg">
  <!-- Your content -->
</div>
```

Or use the custom `.prose-blog` class for blog posts.

### Components

All components accept props for easy customization:

```astro
<Hero
  heading="Welcome to Success"
  description="We help businesses thrive"
  primaryCTA={{ label: "Get Started", href: "/contact" }}
/>
```

## 📁 Project Structure

```
├── public/              # Static assets (images, fonts)
├── src/
│   ├── components/
│   │   ├── common/      # Header, Footer, ContactForm
│   │   └── sections/    # Hero, Services, About, etc.
│   ├── content/
│   │   └── blog/        # Blog posts (Markdown)
│   ├── data/            # JSON content files
│   ├── layouts/         # Page layouts with SEO
│   ├── pages/           # Routes and pages
│   ├── styles/          # Global CSS with Tailwind config
│   └── utils/           # Helper functions
├── astro.config.mjs     # Astro configuration
├── wrangler.toml        # Cloudflare deployment config
└── package.json
```

## 📝 Content Management

### Page Content

Edit JSON files in `src/data/`:

- `site.json` - Global site information
- `navigation.json` - Header/footer navigation
- Component-specific data files

### Blog Posts

Add Markdown files to `src/content/blog/`:

```markdown
---
title: "Post Title"
description: "Brief description"
author: "Author Name"
date: 2024-01-20
tags: ["business", "technology"]
featured: true
featuredImage: "/images/blog/hero.jpg"
---

Your post content here...
```

### Forms

Configure form handling in `.env`:

```bash
# Option 1: Google Sheets
PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/...

# Option 2: API Endpoint
PUBLIC_API_ENDPOINT=https://api.example.com/contact

# Option 3: Spam Protection
PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
```

### Newsletter Subscribe Form

1. Copy `shared/newsletter/SubscribeForm.tsx` from the SocialTide monorepo (or keep a local copy in `shared/` and sync changes regularly).
2. Place it in `src/components/SubscribeForm.tsx` (or any preferred location).
3. Configure the Harbor API environment variables:

   ```env
   PUBLIC_SOCIALTIDE_API_BASE=https://harbor.socialtide.ai
   PUBLIC_SOCIALTIDE_CLIENT_ID=<client-uuid-from-backend>
   ```

4. Render the component where you want the newsletter opt-in:

   ```tsx
   import SubscribeForm from "../components/SubscribeForm";

   export default function NewsletterBlock() {
     return (
       <section className="space-y-4">
         <h2 className="text-2xl font-semibold">Stay in the loop</h2>
         <SubscribeForm source="blog" />
       </section>
     );
   }
   ```

5. Override `className`, `inputClassName`, or `buttonClassName` to match the client’s Tailwind tokens—the shared component ships with neutral defaults on purpose.

## 📈 Analytics & Tracking

- Set `PUBLIC_POSTHOG_KEY` (and optional `PUBLIC_POSTHOG_HOST`, defaults to `https://app.posthog.com`) in your `.env`.
- The template automatically injects the PostHog snippet and initializes enhanced tracking (CTA clicks, form engagement, content engagement) once PostHog finishes loading.
- Use `data-track-cta`, `data-track-form`, and `data-track-content` attributes on interactive elements to capture additional context—see `src/lib/posthog-tracking.ts` for supported helpers.
- Leave the env vars blank if you do not want PostHog included in a deployment.

## 🚀 Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial client setup"
git remote add origin https://github.com/youraccount/client-name
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > Workers & Pages
2. Create Application > Pages > Connect to Git
3. Select your repository
4. Configure build settings:
   - **Framework preset**: Astro
   - **Build command**: `bun run build`
   - **Build output directory**: `dist`

### 3. Environment Variables

Add any environment variables in Cloudflare Pages settings.

### 4. Custom Domain

1. Add custom domain in Pages settings
2. Update `wrangler.toml`:
   ```toml
   routes = [
     { pattern = "clientdomain.com", custom_domain = true },
     { pattern = "www.clientdomain.com", custom_domain = true },
   ]
   ```

## 🛠️ Development Commands

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:4321)
bun dev

# Build for production
bun build

# Preview production build
bun preview

# Format code
bunx prettier --write .

# Check TypeScript
bunx astro check
```

## 🐛 Troubleshooting

### Build Errors

**"Cannot apply unknown utility class"**

- Ensure `@reference` directive is in component styles
- Check that colors are defined in `@theme` block

**"Can't resolve '@tailwindcss/typography'"**

- Run `bun add -D @tailwindcss/typography`
- Ensure `@plugin` directive in global.css

### Tailwind v4 Notes

This template uses Tailwind CSS v4 with CSS-based configuration:

- No `tailwind.config.js` file needed
- Colors defined in `@theme` block in CSS
- Plugins imported with `@plugin` directive
- Component styles need `@reference` for custom utilities

### URL Structure

The template uses trailing slashes (`/about/` instead of `/about`) to:

- Match Astro's build output structure
- Avoid unnecessary redirects on Cloudflare
- Improve performance and SEO

### Security Headers

The `public/_headers` file configures:

- Security headers (CSP, X-Frame-Options, etc.)
- Caching rules for optimal performance
- Protection against common web vulnerabilities

### AI-Friendly SEO

The `robots.txt` explicitly allows:

- GPTBot (OpenAI)
- Claude-Web (Anthropic)
- PerplexityBot
- Other AI search crawlers

This ensures your client's content is discoverable by modern AI search engines.

### Development Issues

**Port already in use**

```bash
# Kill process on port 4321
lsof -ti:4321 | xargs kill -9
```

**Dependency issues**

```bash
# Clear cache and reinstall
rm -rf node_modules .astro
bun install
```

## 🔧 Advanced Configuration

### Adding New Sections

1. Create component in `src/components/sections/`
2. Import in page file
3. Add corresponding data file in `src/data/`

### SEO Optimization

The template includes:

- Meta tags (title, description, keywords)
- Open Graph tags
- Twitter Card tags
- Canonical URLs with trailing slashes
- Sitemap generation
- AI-friendly robots.txt
- Security headers via \_headers file

### Performance

- Images: Use Astro's `<Image>` component
- Fonts: Loaded with `preconnect`
- CSS: Tailwind purges unused styles
- JS: Minimal client-side JavaScript

## 🤝 SocialTide Integration

This template is designed for:

- Git-based content management
- One-click publishing via git push
- Integration with SocialTide CMS
- Automated deployments

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Cloudflare Pages](https://developers.cloudflare.com/pages)
- [OKLCH Color Space](https://oklch.com)

## 📄 License

This template is released under the MIT License. See [`LICENSE`](./LICENSE) for details.

## 🆘 Support

- **Template Issues**: [GitHub Issues](https://github.com/socialtide/astro-template/issues)
- **SocialTide Support**: support@socialtide.ai
- **Technical Questions**: titus@socialtide.ai

---

Built with ❤️ by [SocialTide](https://socialtide.ai) - Your Complete Digital Team
