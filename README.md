# photo_folio_2

Fine art photography portfolio.

**Stack:** Astro 6 (static + hybrid) · Svelte 5 islands · Cloudflare Pages · Resend (outbound email).

## Project layout

```
src/
├── content/
│   ├── photos/          # one .md per image (frontmatter = metadata)
│   └── series/          # one .md per body of work
├── components/
│   ├── Gallery.svelte   # interactive grid + lightbox
│   └── ContactForm.svelte
├── pages/
│   ├── index.astro      # portfolio (prerendered)
│   ├── contact.astro    # contact page (prerendered)
│   └── api/
│       └── contact.ts   # Worker route — sends email via Resend
└── content.config.ts    # zod schema for the collections
```

All pages prerender to static HTML. Only `/api/contact` runs as a Worker.

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
