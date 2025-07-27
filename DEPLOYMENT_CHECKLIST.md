# SocialTide Client Deployment Checklist

Use this checklist when deploying a new client website from this template. Check off each item as you complete it.

## 🚀 Phase 1: Initial Setup

### Repository Setup
- [ ] Clone template: `git clone https://github.com/socialtide/client-template.git CLIENT_NAME`
- [ ] Remove template history: `rm -rf .git`
- [ ] Initialize new repo: `git init`
- [ ] Install dependencies: `bun install`

### GitHub Repository
- [ ] Create new private repository: `https://github.com/socialtide/CLIENT_NAME`
- [ ] Add remote: `git remote add origin https://github.com/socialtide/CLIENT_NAME`
- [ ] Initial commit: `git add . && git commit -m "Initial setup for CLIENT_NAME"`
- [ ] Push to GitHub: `git push -u origin main`

## 📝 Phase 2: Client Configuration

### Replace CLIENT_NAME Placeholders
Update all instances of `CLIENT_NAME` in the following files:

- [ ] `package.json` - Update `name` field
- [ ] `wrangler.toml` - Update `name` and `routes.pattern`
- [ ] `astro.config.mjs` - Update `site` URL
- [ ] `src/data/site.json` - Update all CLIENT NAME references and URLs
- [ ] `CLAUDE.md` - Update client details section
- [ ] `public/robots.txt` - Update sitemap URL

### Update Site Content

#### Site Information (`src/data/site.json`)
- [ ] `siteName` - Official client name
- [ ] `siteUrl` - Preview URL (https://CLIENT_NAME.socialtide.ai)
- [ ] `author` - Client business name
- [ ] `defaultTitle` - SEO title with keywords
- [ ] `defaultDescription` - 150-160 character description
- [ ] `defaultKeywords` - Relevant keywords
- [ ] `contact.email` - Client email
- [ ] `contact.phone` - Client phone
- [ ] `contact.address` - Full business address
- [ ] `socialLinks` - All social media URLs

#### Navigation (`src/data/navigation.json`)
- [ ] Review and update navigation items
- [ ] Ensure all links match actual pages

#### CLAUDE.md Client Details
- [ ] Client industry
- [ ] Primary services
- [ ] Target audience
- [ ] Brand voice & tone
- [ ] Custom features or integrations

## 🎨 Phase 3: Brand Customization

### Colors (`src/styles/global.css`)
- [ ] Update primary color scale in `@theme` block
- [ ] Use [oklch.com](https://oklch.com) to generate values
- [ ] Test color contrast for accessibility

### Fonts (if custom)
- [ ] Add font files to `public/fonts/`
- [ ] Update font imports in `BaseLayout.astro`
- [ ] Update font family in CSS

### Images & Assets
- [ ] Add logo to `public/images/`
- [ ] Add favicon to `public/`
- [ ] Optimize all images (WebP format preferred)
- [ ] Update Open Graph image

## 🔧 Phase 4: Environment Setup

### Create `.env` file (if needed)
- [ ] `PUBLIC_GOOGLE_SHEETS_URL` - For form submissions
- [ ] `PUBLIC_API_ENDPOINT` - For custom API
- [ ] `PUBLIC_TURNSTILE_SITE_KEY` - For spam protection
- [ ] Add `.env` to `.gitignore`

### Test Forms Locally
- [ ] Verify contact form submission
- [ ] Test error handling
- [ ] Check success messages

## ☁️ Phase 5: Cloudflare Setup

### Cloudflare Pages
1. [ ] Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. [ ] Navigate to Workers & Pages
3. [ ] Create Application > Pages > Connect to Git
4. [ ] Select the CLIENT_NAME repository
5. [ ] Configure build settings:
   - Framework preset: `Astro`
   - Build command: `bun run build`
   - Build output directory: `dist`
6. [ ] Add environment variables (if any)
7. [ ] Deploy

### Preview Domain
- [ ] Verify deployment at `https://CLIENT_NAME.socialtide.ai`
- [ ] Check that trailing slashes work correctly
- [ ] Test all pages and navigation

## ✅ Phase 6: Pre-Launch Testing

### Functionality Testing
- [ ] All pages load without errors
- [ ] Navigation works on desktop and mobile
- [ ] Contact form submits successfully
- [ ] Blog posts display correctly
- [ ] 404 page works

### SEO & Performance
- [ ] Run Lighthouse audit
- [ ] Check meta tags on all pages
- [ ] Verify sitemap generation
- [ ] Test Open Graph preview
- [ ] Check robots.txt is accessible

### Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Security Headers
- [ ] Verify `_headers` file is working
- [ ] Check CSP in browser console
- [ ] Test HTTPS redirect

## 🌐 Phase 7: Production Domain Setup

### When Ready for Production
1. [ ] Add custom domain in Cloudflare Pages settings
2. [ ] Update `wrangler.toml`:
   ```toml
   routes = [
     { pattern = "clientdomain.com", custom_domain = true },
     { pattern = "www.clientdomain.com", custom_domain = true },
   ]
   ```
3. [ ] Update `astro.config.mjs` site URL
4. [ ] Update `src/data/site.json` siteUrl
5. [ ] Update `robots.txt` sitemap URL
6. [ ] Commit and push changes
7. [ ] Update DNS records (if not using Cloudflare DNS)

## 📊 Phase 8: Post-Deployment

### Verification
- [ ] Production domain loads correctly
- [ ] SSL certificate is valid
- [ ] www redirects to non-www (or vice versa)
- [ ] All forms work on production
- [ ] Analytics tracking (if configured)

### Documentation
- [ ] Update CLAUDE.md with production URLs
- [ ] Document any custom features
- [ ] Note any special deployment considerations
- [ ] Share credentials with team

### Client Handoff
- [ ] Provide CMS access (if applicable)
- [ ] Share style guide
- [ ] Document content update process
- [ ] Schedule training (if needed)

## 🔄 Ongoing Maintenance

### Regular Tasks
- [ ] Monitor site performance
- [ ] Check for framework updates
- [ ] Review analytics
- [ ] Update content as needed
- [ ] Backup important changes

### SocialTide Integration
- [ ] Configure git sync with SocialTide CMS
- [ ] Set up automated content updates
- [ ] Enable performance monitoring

---

## Quick Commands Reference

```bash
# Development
bun dev                          # Start dev server
bun build                        # Build for production
bun preview                      # Preview production build

# Deployment
git add .                        # Stage changes
git commit -m "Update: desc"     # Commit changes
git push origin main             # Deploy to Cloudflare

# Troubleshooting
rm -rf node_modules .astro       # Clear cache
bun install                      # Reinstall dependencies
```

## Support Contacts

- **Template Issues**: [GitHub Issues](https://github.com/socialtide/client-template/issues)
- **SocialTide Support**: support@socialtide.ai
- **Technical Lead**: titus@socialtide.ai
- **Cloudflare Status**: [status.cloudflare.com](https://www.cloudflarestatus.com/)

---

Last updated: 2024-12-28