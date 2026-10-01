# Handover notes

For whoever picks this up next. `README.md` covers the layout and how to run
it; `docs/DEPLOYMENT.md` covers shipping it. This file is the context that is
not in either: what is decided, what is not, and where the sharp edges are.

## State

Not yet deployed anywhere. Everything below was verified on this commit.

- `npm test` — 74 passing (56 client, 18 server)
- `npm run lint` — clean
- `npm audit --omit=dev` — 0 vulnerabilities
- Built, served by the real Express process, and exercised in a browser: all
  routes answer, a booking made through the form lands in the store, an
  invalid one comes back 422, no CSP violations.

Read `git log`. The commit messages carry the reasoning for most of what
looks unusual, and are more use than this file for any specific decision.

## Needs a decision before launch

None of these are bugs. They are facts about the business nobody has
supplied, and each was deliberately left unstated rather than guessed at,
because a confident wrong answer on a live site is worse than a gap.

| What | Where | Consequence while unset |
|---|---|---|
| Instagram / Facebook URLs | `client/src/data/site.js` → `socialProfiles` | Both `null`, so those icons do not render. Deliberate — better than a link to nowhere. |
| Opening times | `client/src/data/site.js` → `serviceHours` | Opening hours are omitted from the structured data. Search engines ignore an hours block with no times, so publishing a half one is worse than none. |
| Halal position | nowhere — nothing claims it | A hard yes/no filter for Middle Eastern and Malaysian visitors. The keyword research calls it the highest-value non-English term on the list. |
| Named cuts | smokehouse pages name none | "Smoked brisket / ribs / pulled pork" are strong search terms. Nobody confirmed they are on the menu, so nothing was invented. |

**Landmark distances need checking.** `client/src/data/content.js` →
`nearbyLandmarks`. They were derived from the site's coordinates against
mapped landmark positions and cross-checked against published figures — not
driven. They feed the visit page, the structured data and `llms.txt` at once.
Someone who knows those roads should go through them.

## Sharp edges

**The CSP will block any third-party script you add.** Analytics, a chat
widget, a booking embed — all blocked until the origin is added in *five*
places: `client/vercel.json`, `client/public/_headers`,
`client/public/.htaccess`, `server/src/middleware/security.js`, and the nginx
block in the deployment doc. They are meant to stay identical.

**`TRUST_PROXY` must match reality.** Too low behind a proxy and the rate
limiter sees every visitor as one client. Too high and a client can forge a
forwarded header and walk around it.

**`RESERVATIONS_FILE` must be on a persistent volume.** It defaults inside
`server/data/`, which a container rebuild wipes. Bookings are the one piece
of state here.

**Images are generated, and the generator is slow.** `npm run build` runs it
first. It encodes AVIF and scores each variant against the WebP it would
replace, which takes a couple of minutes from cold. Re-runs skip anything
whose source has not changed. Do not commit `client/src/assets/images/generated/`.

**`sitemap.xml`, `robots.txt` and `llms.txt` are generated too**, from the
route list and page data. Edit the data, not the files — the files are
gitignored and rebuilt.

**`PRODUCTION_ORIGIN`** in `client/src/data/routes.js` is
`https://hillsedgeberagala.com`. The sitemap and robots are generated from
it. Change it there if the domain differs.

## Things that look odd and are not

- **The webfont loads on `media="print"`** and is switched on by JS. A plain
  stylesheet link blocks first paint; measured against a host that hangs, it
  was over twelve seconds of blank page.
- **AVIF exists for only some photographs.** Each is scored against its WebP
  and kept only if it matches on quality and is smaller — decided per
  photograph, never per width, because `<picture>` commits to one source type
  and will not fall back for a missing size.
- **The JSON-LD escapes `<`.** Not currently exploitable, since `textContent`
  on a detached element does not go through the HTML parser. It matters the
  day this is server-rendered.
- **`express.json` strictness means a JSON primitive is a 400**, not a 422.
  The body is malformed; it never reaches validation. There is a test on it.

## If you want to simplify

The Express server exists to take bookings. If that is dropped, the front end
is a pure static site again: `npm run build` and upload `client/dist` to any
static host, with the Apache / Netlify / Vercel configs already in it. The
form falls back to WhatsApp on its own when the API is unreachable, so
nothing breaks — bookings just stop being recorded.
