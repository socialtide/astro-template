# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this CLIENT NAME website.

## Project Overview

This is the marketing website for CLIENT NAME, built with Astro and deployed on Cloudflare Workers. It's managed by SocialTide as part of our complete digital presence management service.

**Client Details:**
- Client Name: CLIENT NAME
- Industry: [Industry]
- Primary Services: [List main services]
- Target Audience: [Describe target audience]

## Development Commands

```bash
# Install dependencies
bun install

# Start development server
bun dev              # Runs on http://localhost:4321

# Build for production  
bun build

# Preview production build
bun preview

# Deploy (automatic via git push)
git push origin main
```

## Architecture

### Tech Stack
- **Framework**: Astro 5.12+ (Static Site Generator)
- **Styling**: Tailwind CSS 4 with Vite plugin
- **Icons**: Lucide Icons
- **Hosting**: Cloudflare Workers
- **CMS**: SocialTide Backend (git-based sync)

### Project Structure
- `/src/pages/` - Astro pages and routes
- `/src/components/` - Reusable components
- `/src/layouts/` - Page layouts
- `/src/content/blog/` - Blog posts (Markdown)
- `/src/data/` - JSON data files for content
- `/public/` - Static assets

## Brand Guidelines

### Colors
- Primary: Defined in `src/styles/global.css` using OKLCH color space
- Update colors in the `@theme` block
- Secondary: [Add color]
- Text: Gray scale

### Typography
- Font: Inter
- Headings: Bold, tracking-tight
- Body: Regular, leading-relaxed

### Voice & Tone
- [Describe brand voice]
- [Key messaging points]

## Content Management

### Editing Content
All site content is managed through JSON files in `/src/data/`:
- `site.json` - Site metadata and contact info
- `navigation.json` - Header and footer navigation
- Additional data files for each section

### Blog Posts
Add new blog posts as Markdown files in `/src/content/blog/`:
```markdown
---
title: "Post Title"
description: "Brief description"
author: "Author Name"
date: 2024-01-15
tags: ["tag1", "tag2"]
featured: false
---

Post content here...
```

## Deployment

### Preview URL
https://CLIENT_NAME.socialtide.ai

### Production Domains
- Primary: [clientdomain.com]
- www: [www.clientdomain.com]

### Deployment Process
1. Make changes locally
2. Test with `bun dev`
3. Commit changes: `git add . && git commit -m "Update: description"`
4. Push to deploy: `git push origin main`
5. Cloudflare automatically builds and deploys

## Form Handling

Forms are configured to use:
- [ ] Google Sheets integration
- [ ] SocialTide API endpoint
- [ ] Cloudflare Turnstile for spam protection

Update `.env` with appropriate keys.

## Custom Features

[List any client-specific features or integrations]

## Support

For technical issues or questions:
- SocialTide Support: support@socialtide.ai
- Technical Lead: titus@socialtide.ai

## Important Notes

- Always test locally before pushing
- Keep brand consistency across all pages
- Optimize images before uploading
- Follow SEO best practices for all content
- Regular content updates via SocialTide CMS