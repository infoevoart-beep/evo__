# Deploying Hillsedge Beragala

The site is a static single-page app. `npm run build` writes everything a
host needs into `dist/` — there is no server-side component and no runtime
environment to configure.

```bash
npm install
npm run build     # regenerates images + sitemap, then builds into dist/
```

Upload the **contents** of `dist/` to the web root.

## Two things every host must get right

**1. SPA fallback.** Routes like `/cuisine` are handled in the browser, so any
path that is not a real file must serve `index.html` with a **200** — not a
redirect and not a 404. Without this, deep links and refreshes break.

**2. Security headers.** The build ships config for the common hosts; use
whichever matches. All three carry the same policy, so if you change one,
change the others.

| Host | File | Notes |
|---|---|---|
| Vercel | `vercel.json` (repo root) | Picked up automatically. |
| Netlify / Cloudflare Pages | `dist/_headers`, `dist/_redirects` | Picked up automatically. |
| Apache / cPanel | `dist/.htaccess` | Needs `mod_headers` and `mod_rewrite`. |
| nginx | see below | Paste into your server block. |

### nginx

```nginx
server {
    root /var/www/hillsedge/dist;
    index index.html;

    add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; frame-src https://maps.google.com https://www.google.com; connect-src 'self'; manifest-src 'self'; upgrade-insecure-requests" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "DENY" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Hashed filenames — safe to cache forever.
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # The shell must revalidate, or a deploy strands visitors on asset URLs
    # that no longer exist.
    location = /index.html {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # Client-side routing.
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
```

> nginx's `add_header` does not inherit into a `location` block that declares
> its own. If you add headers inside `location /assets/`, repeat the security
> headers there too.

## What the build produces

| File | Purpose |
|---|---|
| `index.html`, `assets/` | The app. Asset filenames are content-hashed. |
| `sitemap.xml`, `robots.txt` | Generated from the router's route list. |
| `llms.txt` | Plain-text brief for AI answer engines, generated from the same page data. |
| `_headers`, `_redirects` | Netlify / Cloudflare Pages. |
| `.htaccess` | Apache / cPanel. **Hidden file — make sure your upload tool copies it.** |

## Before going live

- **HTTPS is required.** `upgrade-insecure-requests` and HSTS assume it, and
  HSTS with `preload` is hard to undo — serve HTTPS correctly first.
- **Set the domain.** `PRODUCTION_ORIGIN` in `src/data/routes.js` feeds
  `sitemap.xml` and `robots.txt`. It is currently
  `https://hillsedgeberagala.com`.
- **Fill in the two blanks** in `src/data/site.js`:
  - `socialProfiles` — Instagram and Facebook URLs. Icons stay hidden while
    these are `null`, rather than linking nowhere.
  - `serviceHours` — `opens` and `closes` as `"HH:MM"`. Opening hours are
    left out of the structured data until both are set, because search
    engines ignore an hours block with no times on it.

## Verifying a deploy

```bash
curl -I https://your-domain/                                        # security headers present
curl -o /dev/null -w '%{http_code}\n' https://your-domain/cuisine   # expect 200, not 404
curl -o /dev/null -w '%{http_code}\n' https://your-domain/llms.txt  # expect 200
```

Then load the site and check the browser console is free of CSP violations.
If you add a third-party script, analytics or embed later, it will be blocked
until you add its origin to the CSP in all four places (`vercel.json`,
`public/_headers`, `public/.htaccess`, and the nginx block above).

Worth checking once the domain is live:

- **Rich Results Test** (`search.google.com/test/rich-results`) — the visit
  page should report Restaurant, Breadcrumb and FAQ.
- **Search Console** — submit `sitemap.xml`, then read the search-terms report
  after a few weeks. It beats any keyword guess.
- **Security headers** (`securityheaders.com`) — expect an A grade with the
  shipped config.

## SEO facts that live in the code

These are generated, not hand-written, so edit the source and rebuild:

- **Page titles and descriptions** — the `useDocumentTitle` call at the top of
  each file in `src/pages/`. Keep titles under 60 characters and descriptions
  under 160, or search engines truncate them.
- **Nearby landmarks and distances** — `nearbyLandmarks` in
  `src/data/content.js`. These feed the visit page, the structured data and
  `llms.txt` at once. **The distances are derived from mapping data, not
  driven — have someone who knows the roads check them.**
- **FAQs** — `faqs` in `src/data/content.js`, published as FAQPage structured
  data that search and AI answers quote directly.

Two positions are deliberately unstated and cost traffic while they stay that
way:

- **Halal.** Nothing on the site claims it either way. It is a hard yes/no
  filter for Middle Eastern and Malaysian visitors — if they cannot confirm
  it, they do not come.
- **Named cuts.** The smokehouse pages never name a cut. If brisket, ribs or
  pulled pork are actually on the menu, saying so is the cheapest search win
  available.
