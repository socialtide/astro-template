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

# Preview production build locally
preview-local:
    bun run preview

# Deploy preview/staging site
preview: build
    bunx wrangler deploy --env staging

# Tear down preview/staging site
preview-down:
    bunx wrangler delete --env staging

# Deploy to production
deploy: build
    bunx wrangler deploy --env production
