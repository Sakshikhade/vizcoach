# Netlify frontend + Jetstream backend

VizCoach uses **Create React App** (not Vite). The API URL env var is:

```bash
REACT_APP_POCKETBASE_URL=...
```

PocketBase on Jetstream runs on **port 8090** (not 8000).

## Architecture

```text
User browser
    ↓
https://your-app.netlify.app     (React static site)
    ↓ API calls
http(s)://149.165.153.148:8090   (PocketBase on Jetstream)
```

The frontend talks to PocketBase via `src/db/client.ts` — it does not redirect the whole Netlify site to the IP.

## Deploy frontend to Netlify

1. Push the repo to GitHub (or connect your Git provider in Netlify).
2. In Netlify: **Add new site** → **Import from Git**.
3. Build settings (or use root `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
4. **Environment variables** (Site settings → Environment variables):

   | Key                        | Value (pick one strategy below) |
   | -------------------------- | ------------------------------- |
   | `REACT_APP_POCKETBASE_URL` | See Option A or B               |

5. Deploy. React Router needs `public/_redirects` (already in repo).

## Option A — HTTPS API on Jetstream (recommended)

Best for **chat and realtime** (PocketBase subscriptions). Netlify cannot reliably proxy WebSockets/SSE.

1. Point a hostname at `149.165.153.148` (e.g. [DuckDNS](https://www.duckdns.org/) + free subdomain).
2. On the Jetstream VM, terminate TLS with Caddy or nginx and proxy to `127.0.0.1:8090`.
3. In Netlify:

   ```bash
   REACT_APP_POCKETBASE_URL=https://api-vizcoach.duckdns.org
   ```

4. In PocketBase admin (`https://api-vizcoach.duckdns.org/_/`):
   - **Settings → Application** → add your Netlify URL to allowed origins if needed.
   - **Settings → Auth** → configure OAuth redirect URLs for Google if you use it.

5. Open Jetstream **security group / firewall** for ports **443** (and **80** for ACME).

`public/_redirects` should only contain the SPA rule (no `/api/*` proxy).

## Option B — Netlify API proxy (quick demo, limited)

Avoids mixed content by calling `/api/...` on the same origin as Netlify.

1. In `public/_redirects`, **uncomment**:

   ```text
   /api/*  http://149.165.153.148:8090/api/:splat  200
   ```

   Keep the `/* /index.html 200` line below it.

2. In Netlify:

   ```bash
   REACT_APP_POCKETBASE_URL=https://your-site.netlify.app
   ```

3. Redeploy.

**Caveat:** Realtime features (chat, live submission updates) may not work through Netlify’s proxy. Use Option A for full functionality.

## Mixed content warning

If Netlify is **HTTPS** and the API is **HTTP**:

```text
https://yourapp.netlify.app  →  http://149.165.153.148:8090
```

browsers block this. Fix with Option A (HTTPS API) or Option B (proxy).

## Jetstream backend (already running)

Backend should stay on Jetstream with systemd:

```bash
sudo systemctl status vizcoach
```

API-only hosting: you can stop serving the React app from `pb_public` on the server; Netlify serves the UI. PocketBase still needs `pb_data` and the `backend` binary.

## Local vs production env

| Environment          | `REACT_APP_POCKETBASE_URL`         |
| -------------------- | ---------------------------------- |
| Local dev            | `http://127.0.0.1:8090`            |
| All-in-one Jetstream | `http://149.165.153.148:8090`      |
| Netlify + HTTPS API  | `https://api-vizcoach.example.com` |
| Netlify + proxy      | `https://your-site.netlify.app`    |

## Redeploy after code changes

- **Frontend:** push to Git → Netlify auto-builds, or run `npm run build` locally and drag `build/` to Netlify.
- **Backend / DB:** SSH to Jetstream; restart `vizcoach` service after PocketBase or migration changes.

## Current all-in-one URL

Everything on Jetstream (no Netlify):

- App: http://149.165.153.148:8090
- Admin: http://149.165.153.148:8090/_/

You can keep this while testing Netlify; use a separate Netlify site with the env vars above.
