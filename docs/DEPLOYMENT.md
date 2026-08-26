# Deployment

The frontend is a static single-page application. `npm run build` emits `dist/`,
which any static host can serve — no Node runtime is required at the edge.

---

## Build

```bash
npm ci
npm run build
```

`build` runs `tsc -b` first, so a type error fails the build rather than shipping.
Output lands in `dist/` with per-route chunks (`autoCodeSplitting`); Recharts is
confined to the reports chunk.

Verify locally before shipping:

```bash
npm run preview
```

---

## Environment

Vite inlines `VITE_*` variables **at build time**. There is no runtime config, so
each environment needs its own build.

| Variable | Required | Example |
| --- | --- | --- |
| `VITE_APP_BASE_URL` | yes | `https://api.example.com/` |
| `VITE_APP_NAME` | no | `StayHub` |
| `VITE_APP_CURRENCY` | no | `NGN` |

**The trailing slash on `VITE_APP_BASE_URL` is required.** The client builds
`${VITE_APP_BASE_URL}api/v1/<path>`; without it you get `…comapi/v1/…`.

Never put a secret in a `VITE_*` variable — everything prefixed `VITE_` is
compiled into the JavaScript bundle and is public.

---

## SPA rewrites

Client-side routing means every unknown path must serve `index.html`, or a
refresh on `/dashboard/reports` returns 404.

**Netlify** — `public/_redirects`:

```
/*  /index.html  200
```

**Vercel** — `vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Nginx:**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache** — `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**`serve`** (matching the sibling projects' `start` script):

```bash
npx serve -s dist
```

---

## Caching

Assets under `dist/assets/` carry content hashes and can be cached immutably.
`index.html` must not be:

```nginx
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location = /index.html {
  add_header Cache-Control "no-cache";
}
```

Serving a stale `index.html` points browsers at hashed chunks that no longer
exist, producing blank pages after a release.

---

## API requirements

The API must:

1. **Be reachable from the browser**, not just from the server. The frontend
   calls it directly; no proxy is configured.
2. **Allow the frontend origin via CORS.** The API currently uses bare
   `app.use(cors())`, which allows every origin. Narrow it to the deployed
   frontend origin before going to production.
3. **Be served over HTTPS** if the frontend is. A page on HTTPS cannot call an
   HTTP API — the browser blocks it as mixed content.

The auth cookie is set with `secure: true` automatically when the page is served
over HTTPS.

---

## Before going live

- [ ] `VITE_APP_BASE_URL` points at the production API, with a trailing slash
- [ ] SPA rewrite rule is in place — test a hard refresh on a nested route
- [ ] `index.html` is served `no-cache`; hashed assets are immutable
- [ ] CORS on the API is narrowed to the frontend origin
- [ ] Seeded demo accounts from `npm run seed` are removed or their passwords
      changed
- [ ] `JWT_SECRET` on the API is a real secret, not the `fallback-secret` default
      the middleware falls back to
- [ ] Role escalation on `POST /auth/register` is restricted server-side — the
      endpoint currently accepts `role: "ADMIN"` from anonymous callers (see
      [API_INTEGRATION.md](API_INTEGRATION.md#authentication--auth))
- [ ] `npm run build` and `npm run lint` are clean

---

## CI outline

```yaml
- run: npm ci
- run: npm run lint
- run: npm run build
  env:
    VITE_APP_BASE_URL: ${{ vars.API_BASE_URL }}
```

`npm run build` covers type-checking, so a separate `tsc` step is redundant.
