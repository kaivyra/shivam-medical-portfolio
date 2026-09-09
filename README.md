# Shivam Maurya — Portfolio

A static, dependency-free portfolio site. No build step, no framework —
just `index.html`, `style.css`, and `script.js`, so it runs anywhere:
GitHub Pages, Netlify, Vercel, or a plain web host.

## Structure

```
shivam-portfolio/
├── index.html          Page markup, SEO meta tags, structured data
├── style.css           All styling (design tokens at the top of the file)
├── script.js           Mobile nav, scroll-spy, footer year — no libraries
├── site.webmanifest     Home-screen / PWA metadata
├── robots.txt           Crawler rules + sitemap pointer
├── sitemap.xml          Search-engine sitemap
├── assets/
│   └── favicon.svg      Tab icon (monogram, matches the site's accent)
└── README.md
```

## Before you publish — replace these placeholders

| Placeholder | Where | Replace with |
|---|---|---|
| `https://www.shivammaurya.example/` | `index.html` (canonical, Open Graph), `robots.txt`, `sitemap.xml` | Your real domain |
| `shivam.maurya@example.com` | `index.html` contact section | Your real email |
| `https://www.linkedin.com/in/shivam-maurya-example/` | `index.html` contact section | Your real LinkedIn URL |
| `assets/og-cover.png` | `index.html` Open Graph/Twitter tags | A real 1200×630 image, or remove the tags |
| `assets/apple-touch-icon.png`, `assets/icon-192.png`, `assets/icon-512.png` | referenced in `index.html` / `site.webmanifest` | Real PNG icons (only `favicon.svg` is included by default) |

The site works with these left as-is, but search engines and link
previews will show placeholder values until you swap them.

## Local preview

Just open `index.html` in a browser — no server required. For a closer
match to production (correct relative paths, no `file://` quirks), run
a tiny local server instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Any static host works. For example, with GitHub Pages: push this folder
to a repository and enable Pages on the `main` branch — no build step
needed.

## Notes on the build

- **Accessibility**: skip-to-content link, semantic landmarks, visible
  focus states, `aria-expanded`/`aria-controls` on the mobile menu,
  `prefers-reduced-motion` respected throughout.
- **Performance**: no JS or CSS frameworks, one web-font request,
  `defer` on the script, system-font fallback so text renders instantly.
- **SEO**: descriptive title/meta description, Open Graph + Twitter
  card tags, `Person` structured data (JSON-LD), `robots.txt` +
  `sitemap.xml`.
- **Resilience**: every DOM lookup in `script.js` is null-checked, so
  editing or removing a section later won't throw a console error.
