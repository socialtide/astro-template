# CLAUDE.md — Astro Client Template

This is the canonical template for all SocialTide client deployments. Use it alongside the workspace `CLAUDE.md` and `_shared/README.md` when building or updating a client site.

## Scope & Precedence

- Applies to this template and any client repo created from it.
- Instruction order: direct user/developer direction → workspace `CLAUDE.md` → this guide → client-specific notes.
- Each client has its own `CLAUDE.md` with brand, deployment, and client-specific details.

## Stack & Tooling

- Astro 5, Tailwind CSS 4, TypeScript, Framer Motion, and optional React islands.
- Cloudflare Workers (Pages superset) handles hosting and routing via `wrangler.toml`.
- Package manager: `bun`. Never switch to npm/yarn.
- Formatting: `bun run prettier --write .`
- Key commands:
  ```bash
  bun install      # install deps
  bun dev          # local dev server (http://localhost:4321 by default)
  bun build        # production build output in dist/
  bun preview      # serve the production bundle locally
  ```

## Project Structure

```
astro-template/
├── src/
│   ├── pages/            # Astro route files
│   ├── components/       # Reusable Astro/React components
│   ├── layouts/          # Page skeletons with SEO defaults
│   ├── content/          # Content collections (blog, case studies, etc.)
│   ├── data/             # JSON config (navigation, pricing, testimonials)
│   ├── styles/           # Tailwind/global CSS (Tailwind v4 via global.css)
│   └── lib/              # Utilities (e.g., analytics hooks, helpers)
├── public/               # Static assets
├── astro.config.mjs      # Astro configuration (integrations, aliases)
├── wrangler.toml         # Cloudflare Workers deployment config
└── package.json          # Scripts and dependencies
```

## Customizing for a Client

1. **Clone the template** into the new client repo and update `package.json`, `wrangler.toml`, and environment sample files with the client name/domain.
2. **Brand theming:** adjust colors, gradients, and font tokens inside the `@theme` block in `src/styles/global.css`. Prefer OKLCH values to maintain contrast and accessibility.
3. **Navigation & site metadata:** update `src/data/site.json`, `src/data/navigation.json`, and any other JSON data files.
4. **Content collections:** configure schemas in `src/content/config.ts` and add Markdown files in the appropriate content directories (blog, case studies, testimonials). Keep frontmatter aligned with Zod schemas.
5. **Components:** create or adapt Astro/React components under `src/components/`. Reuse shared patterns; avoid one-off structures when the same component could live in `shared/`.
6. **Newsletter subscribe UI:** copy `shared/newsletter/SubscribeForm.tsx`, drop it into `src/components/`, and wire `PUBLIC_SOCIALTIDE_API_BASE`/`PUBLIC_SOCIALTIDE_CLIENT_ID` (or pass props directly). Adjust Tailwind classes to match the client brand.
7. **Layouts & SEO:** ensure every page uses a layout that sets title, description, canonical URL, Open Graph, and structured data where needed.

## Integrations & “Call Home” Pattern

- Forms, newsletter signups, and other dynamic interactions should post to SocialTide’s backend (`https://harbor.socialtide.ai`) using `PUBLIC_SOCIALTIDE_CLIENT_ID` (public) and any protected API keys kept in Cloudflare secrets.
- For basic forms you can fall back to Google Sheets or other providers, but standard practice is the backend form endpoint so submissions flow into the context/memory system.
- Use `shared/analytics/Posthog.astro`, `shared/analytics/posthog-tracking.ts`, and `shared/newsletter/SubscribeForm.tsx` to keep analytics + newsletter UX consistent. Copy them into the client repo (or import via a package if we publish one) and configure the required env vars (`PUBLIC_POSTHOG_KEY`, optional `PUBLIC_POSTHOG_HOST`, `PUBLIC_SOCIALTIDE_API_BASE`, `PUBLIC_SOCIALTIDE_CLIENT_ID`).
- If the site requires custom script embeds (e.g., calendaring), wrap them behind feature flags or load them lazily so they do not block First Contentful Paint.

## Cloudflare Workers Deployment

- `wrangler.toml` defines the `[env.staging]` and `[env.production]` routes. Update `name`, `routes`, and environment bindings for each client.
- Deploys are MANUAL via wrangler — pushing to `main` does not deploy. Always deploy staging first, verify the site loads and the changed pages render, then deploy production and verify again:
  ```bash
  just preview      # build as preview + wrangler deploy --env staging
  just preview-down # delete the staging Worker and its custom domain
  just deploy        # bun build + wrangler deploy --env production
  ```
- A preview serves a full copy of the site on a public host, so `just preview` builds with `PUBLIC_SITE_ENV=preview` and stamps the output unindexable: `noindex, nofollow` in the page head, an `X-Robots-Tag` header on every response, and a robots.txt that does not advertise the production sitemap. Production never sets that variable and keeps its normal index directives.
- Tear the preview down with `just preview-down` once you are done looking at it. A preview left running is a second copy of the client's site competing with theirs in search.
- `just preview` and `just deploy` both refuse to run without `PUBLIC_POSTHOG_KEY`. A build from a git worktree does not carry `.env`, and a site shipped without the key records nothing until someone notices the empty dashboard.
- Ensure any required secrets (PostHog key, Harbor API token, Turnstile keys) are set as Cloudflare environment variables before deploying changes that depend on them.

## Quality Checklist

- [ ] `bun build` succeeds without warnings or errors.
- [ ] Prettier formatting has been applied.
- [ ] TypeScript checks (`bunx astro check`) pass when the project uses TypeScript.
- [ ] Layout works at mobile, tablet, and desktop breakpoints.
- [ ] SEO metadata and structured data render correctly (inspect the built HTML).
- [ ] Analytics and “call home” endpoints are configured and tested.
- [ ] Forms include Cloudflare Turnstile or equivalent spam protection.
- [ ] Images are optimized and stored under `public/` or fetched via performant CDNs.

## Common Tasks

- **Add a new landing page:** create `src/pages/<slug>.astro`, import the appropriate layout, pull data from `src/data/` where possible, and register CTAs with analytics attributes (`data-track-cta`, `data-track-section`).
- **Publish a blog post:** add a Markdown file under `src/content/blog/` with valid frontmatter; run `bun build` to ensure the content collection compiles.
- **Add a client-specific partial:** add to `src/components/<client>/` if it truly cannot be shared. Document the rationale in the client repo README and consider backporting to this template when possible.
- **Update forms:** ensure forms submit to the backend using fetch/axios with the client’s `PUBLIC_BASE_URL` or direct `harbor` endpoint. Add hidden fields for UTM attribution if the backend expects them.

## Troubleshooting

- **Build fails:** check for missing imports, invalid frontmatter, or TypeScript errors reported by Astro. Review `astro.config.mjs` for misconfigured integrations.
- **Layout issues:** verify Tailwind classes and theme tokens; confirm `@tailwind` directives are present in global styles.
- **Analytics not firing:** confirm `Posthog.astro` is included in the layout, `PUBLIC_POSTHOG_KEY` is set in the environment, and that you are testing in production mode.
- **Forms not submitting:** inspect network calls to `harbor.socialtide.ai`, confirm the API key is present, and review backend logs or the SocialTide dashboard for errors.

## Documentation & Handoff

- Record client-specific decisions, credentials, and rollout notes in the client repo README or `docs/` directory. Keep this template opinionated and generic.
- When you enhance the template (new components, layouts, utilities), update this guide and `astro-template/README.md` with usage details, then propagate changes to client repos intentionally.

Stay consistent with the shared platform patterns. If a customization feels unique to one client, document why; if it seems broadly useful, backport it here so every deployment benefits.
