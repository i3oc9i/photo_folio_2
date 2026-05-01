# photo_folio_2

Fine art photography portfolio.

**Stack:** Astro 6 (static + hybrid) · Svelte 5 islands · Cloudflare Pages · Resend (outbound email).

## Project layout

```
src/
├── content/
│   ├── site/main.md       # site title, tagline, social links, about (body)
│   ├── projects/*.md      # each project: title, description, year, optional cover
│   ├── photos/*.md        # each photograph; references a project, optionally a story
│   └── stories/*.md       # standalone stories that can be linked from a photo
├── content.config.ts      # zod schemas + cross-collection references
├── layouts/
│   └── Layout.astro       # shared chrome — reads site.md for title/social
├── components/
│   ├── Gallery.svelte     # interactive grid + lightbox
│   └── ContactForm.svelte
└── pages/
    ├── index.astro                # lists projects (with cover from first photo)
    ├── about.astro                # renders site/main.md body
    ├── contact.astro              # contact form
    ├── projects/[slug].astro      # one page per project
    ├── photos/[slug].astro        # one page per photograph (+ EXIF + story link)
    ├── stories/[slug].astro       # one page per story (+ linked photos)
    └── api/contact.ts             # Worker route — sends email via Resend
```

All pages prerender to static HTML. Only `/api/contact` runs as a Worker.

## Editing your site as a photographer

Everything personal lives in `src/content/`. You don't touch any TypeScript to
publish new work.

### Site identity (header, about, social links)

Edit `src/content/site/main.md`. The frontmatter sets the site title, tagline,
your email, and your social links. The markdown body becomes the **About** page.

### Add a project

Create `src/content/projects/<slug>.md`:

```yaml
---
title: "Coastlines"
description: "A short tagline shown on the homepage card."
year: 2025
order: 2
---

Optional longer artist statement (markdown body).
```

### Add a photograph

Create `src/content/photos/<slug>.md`:

```yaml
---
title: "Cliff at dusk"
project: "coastlines"          # required — must match a project slug
story: "october-storms"        # optional — match a story slug
year: 2025
location: "Étretat, France"
image: "/images/cliff-dusk.jpg"  # or remote URL
alt: "Cliff face at dusk with breaking waves"
order: 1
exif:
  camera: "Sony A7R IV"
  lens: "70-200mm f/2.8"
  focalLength: "200mm"
  aperture: "f/8"
  shutter: "1/500s"
  iso: 400
---
```

### Add a story (optional, attach to one or more photos)

Create `src/content/stories/<slug>.md`:

```yaml
---
title: "October storms"
date: 2025-10-12
excerpt: "Three days of weather and what it taught me."
---

Markdown body of the story.
```

Then reference it from a photo via `story: "<slug>"`. The photo page links to
the story; the story page lists the photos that reference it.

## Local development

```bash
bun install
bun run dev          # http://localhost:4321 — hot reload via Vite
bun run build        # outputs dist/ + Worker entry
```

To exercise the Worker runtime locally (so the contact form actually fires):

```bash
bun add -d wrangler
cp .dev.vars.example .dev.vars   # then fill in real values
bun run build
bunx wrangler dev                # http://localhost:8787
```

## Deploy to Cloudflare Pages

**One-time setup**

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick `i3oc9i/photo_folio_2`.
2. Build command: `bun run build` · Output: `dist` · Framework preset: Astro.
3. Add environment variable `BUN_VERSION = 1.3.13` so Cloudflare's builder uses bun.

**Secrets (production)**

Set with wrangler from your machine:

```bash
bunx wrangler secret put RESEND_API_KEY
bunx wrangler secret put CONTACT_TO
bunx wrangler secret put CONTACT_FROM
```

`CONTACT_FROM` must be an address on a domain you've verified in Resend. For testing you can use Resend's `onboarding@resend.dev`.

After the first push to `main`, Cloudflare auto-deploys on every commit.

## Adding a photograph

1. Create `src/content/photos/<slug>.md`:
   ```yaml
   ---
   title: "Forest light"
   year: 2024
   location: "Vosges, France"
   series: "landscapes"
   image: "/images/forest-light.jpg"
   alt: "Sunlight piercing through pine trees"
   order: 1
   ---
   ```
2. Drop the file into `public/images/` (or use a remote URL).
3. The home page picks it up automatically on rebuild.

## Next steps to consider

- **Optimize images:** move from remote URLs to `src/assets/` + `<Image />` from `astro:assets` for AVIF/WebP `srcset`.
- **Spam protection:** add Cloudflare Turnstile to the contact form (free, native CF) — drop a `<Turnstile siteKey={…} />` widget in `ContactForm.svelte` and verify the token in `api/contact.ts`.
- **Custom domain:** Pages → project → Custom Domains.
- **R2 for originals:** if you want to host print-resolution files separately, add an R2 bucket binding in `wrangler.jsonc`.
