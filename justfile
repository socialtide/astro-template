# Client site recipes
# Update YOUR_NAME in wrangler.toml before using

# List available recipes
default:
    @just --list

# Install dependencies
install:
    bun install

# Start local dev server
dev:
    bun run dev

# Build the site
build:
    bun run build

# Run unit tests
test:
    bun run test

# Build, then test
check: build test

# Preview production build locally
preview-local:
    bun run preview

# Deploy preview/staging site
# A preview serves a full copy of the site on a public host. Build it with
# PUBLIC_SITE_ENV=preview and stamp the output unindexable, or it competes with
# the client's production site in search. Tear it down with `just preview-down`
# once you are done looking at it.
preview: check-analytics-env
    PUBLIC_SITE_ENV=preview bun run build
    awk '!d && /^\/\*$/ {print; print "  X-Robots-Tag: noindex, nofollow"; d=1; next} 1' dist/_headers > dist/_headers.tmp && mv dist/_headers.tmp dist/_headers
    @grep -q 'X-Robots-Tag: noindex' dist/_headers || { echo "failed to stamp X-Robots-Tag into dist/_headers"; exit 1; }
    printf '# Preview deploy. Every response carries X-Robots-Tag: noindex, nofollow.\n# Crawling stays allowed so crawlers can actually read that directive, and the\n# production sitemap is deliberately not advertised here.\nUser-agent: *\nAllow: /\n' > dist/robots.txt
    bunx wrangler deploy --env staging

# Tear down preview/staging site
preview-down:
    bunx wrangler delete --env staging

# Deploy to production
deploy: check-analytics-env build
    bunx wrangler deploy --env production

# Refuse to build for a live site without the PostHog key. A deploy from a git
# worktree (which does not carry .env) ships a site with no analytics, and the
# gap is invisible until someone checks the dashboard. This fails earlier, and
# with a clearer message, than the Astro component does.
check-analytics-env:
    @if [ -z "${PUBLIC_POSTHOG_KEY:-}" ] && ! grep -Eq '^PUBLIC_POSTHOG_KEY=.+' .env 2>/dev/null; then \
        echo "PUBLIC_POSTHOG_KEY is not set and .env has no value for it. Deploy from a checkout with .env."; exit 1; fi
