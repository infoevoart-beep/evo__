# Deploying Hillsedge Beragala

There are two ways to run this, and the right one depends on whether you want
the bookings API.

| | What runs | Bookings |
|---|---|---|
| **A — Node** | Express serves the front end and the API | Saved server-side, WhatsApp as a second route |
| **B — Static** | Any static host serves `client/dist` | WhatsApp only; the form's API call fails and falls back |

**Option A is the one to pick** unless you specifically want static hosting.
Without the API, a booking only exists if the guest remembers to press send
inside WhatsApp.

## Option A — Node (recommended)

Needs a host that runs Node 20.11+: a VPS, Railway, Render, Fly, a cPanel
Node app, anything with a process.

```bash
npm install
npm run build          # builds the client into client/dist
cp .env.example .env   # then edit it — see below
npm start              # Express serves client/dist and /api on PORT
```

Put it behind nginx or your platform's router for TLS. Two settings matter:

- **`TRUST_PROXY`** — the number of proxies in front of the process. `1`
  behind a single nginx or Cloudflare, `0` if directly exposed. Wrong here
  and the rate limiter either sees every visitor as one client, or trusts a
  header a client can forge.
- **`RESERVATIONS_FILE`** — bookings are appended here. Point it at a volume
  that survives a redeploy, or you lose them on every deploy.

Keep the process alive with systemd, pm2, or your platform's own supervisor.
It handles `SIGTERM` and finishes in-flight requests before exiting, so a
restart does not drop a booking that was already accepted.

Point your monitor at `GET /api/health`.

### nginx in front of Node

```nginx
server {
    server_name hillsedgeberagala.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

With this, set `TRUST_PROXY=1`. Express sends the security headers itself, so
do not add them here as well — you would get duplicates.

## Option B — Static hosting

No Node, no API. The booking form posts to `/api/reservations`, gets nothing,
shows its "could not reach the kitchen" message and offers WhatsApp — so
bookings still work, they just are not recorded.

```bash
npm install
npm run build     # regenerates images + sitemap, then builds client/dist
```

Upload the **contents** of `client/dist/` to the web root.

## Two things every host must get right

**1. SPA fallback.** Routes like `/cuisine` are handled in the browser, so any
path that is not a real file must serve `index.html` with a **200** — not a
redirect and not a 404. Without this, deep links and refreshes break.

**2. Security headers.** The build ships config for the common hosts; use
whichever matches. All three carry the same policy, so if you change one,
change the others.

| Host | File | Notes |
|---|---|---|
| Vercel | `client/vercel.json` | Picked up automatically. |
| Netlify / Cloudflare Pages | `client/dist/_headers`, `_redirects` | Picked up automatically. |
| Apache / cPanel | `client/dist/.htaccess` | Needs `mod_headers` and `mod_rewrite`. |
| nginx | see below | Paste into your server block. |

### nginx

```nginx
server {
    root /var/www/hillsedge/client/dist;
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
- **Set the domain.** `PRODUCTION_ORIGIN` in `client/src/data/routes.js` feeds
  `sitemap.xml` and `robots.txt`. It is currently
  `https://hillsedgeberagala.com`.
- **Fill in the two blanks** in `client/src/data/site.js`:
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
until you add its origin to the CSP in all four places (`client/vercel.json`, `client/public/_headers`, `client/public/.htaccess`, the
nginx block above, and `server/src/middleware/security.js`).

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
  each file in `client/src/pages/`. Keep titles under 60 characters and descriptions
  under 160, or search engines truncate them.
- **Nearby landmarks and distances** — `nearbyLandmarks` in
  `client/src/data/content.js`. These feed the visit page, the structured data and
  `llms.txt` at once. **The distances are derived from mapping data, not
  driven — have someone who knows the roads check them.**
- **FAQs** — `faqs` in `client/src/data/content.js`, published as FAQPage structured
  data that search and AI answers quote directly.

Two positions are deliberately unstated and cost traffic while they stay that
way:

- **Halal.** Nothing on the site claims it either way. It is a hard yes/no
  filter for Middle Eastern and Malaysian visitors — if they cannot confirm
  it, they do not come.
- **Named cuts.** The smokehouse pages never name a cut. If brisket, ribs or
  pulled pork are actually on the menu, saying so is the cheapest search win
  available.
