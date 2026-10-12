# Netlify frontend + Jetstream backend

VizCoach uses Create React App. The API URL env var is:

```bash
REACT_APP_POCKETBASE_URL=...
```

PocketBase on Jetstream listens on **port 8090**.

## Architecture

```text
User browser
    |
https://vizcoachs.netlify.app          (React static site)
    | API calls
https://vizcoach-api.duckdns.org       (Caddy -> 127.0.0.1:8090)
```

The frontend talks to PocketBase from `src/db/client.ts`. Netlify does not redirect the whole site to the VM.

`deployment/vizcoach.service` starts PocketBase with these allowed origins:

- `https://vizcoachs.netlify.app`
- `https://vizcoach-api.duckdns.org`
- `http://localhost:3000`

## Deploy the frontend to Netlify

1. Push the repo and import it in Netlify (**Add new site** → **Import from Git**).
2. Build settings match the root `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - **Node:** 20
3. Environment variables (Site settings → Environment variables):

   | Key                        | Value                                      |
   | -------------------------- | ------------------------------------------ |
   | `REACT_APP_POCKETBASE_URL` | `https://vizcoach-api.duckdns.org`        |

   Create React App bakes this value in at build time. Change it, then redeploy. A runtime edit of the Netlify env does nothing until the next build.

4. Deploy. React Router needs `public/_redirects` (already in the repo): `/* /index.html 200`.

The live site that matches the systemd unit is `https://vizcoachs.netlify.app`.

## Option A — HTTPS API on Jetstream (recommended)

Chat and other PocketBase subscriptions need a direct API connection. Netlify cannot reliably proxy WebSockets or SSE.

1. Point `vizcoach-api.duckdns.org` at the VM (DuckDNS or another DNS name).
2. On the VM, install Caddy and use `deployment/Caddyfile.example`. That file proxies `vizcoach-api.duckdns.org` to `127.0.0.1:8090`.
3. In Netlify, set `REACT_APP_POCKETBASE_URL=https://vizcoach-api.duckdns.org` and redeploy.
4. In PocketBase admin (`https://vizcoach-api.duckdns.org/_/`):
   - **Settings → Application:** confirm the Netlify origin is allowed. The systemd unit already passes `--origins`.
   - **Settings → Auth:** set Google OAuth redirect URLs if Google login is on.
5. Open the Jetstream security group for **443** and **80** (ACME). PocketBase's own port 8090 can stay bound to localhost once Caddy is in front.

`public/_redirects` should only contain the SPA rule. Leave the `/api/*` line commented.

## Option B — Netlify API proxy (quick demo, limited)

This avoids mixed content by calling `/api/...` on the Netlify origin.

1. In `public/_redirects`, uncomment:

   ```text
   /api/*  http://149.165.153.148:8090/api/:splat  200
   ```

   Keep the `/* /index.html 200` line below it.

2. In Netlify:

   ```bash
   REACT_APP_POCKETBASE_URL=https://vizcoachs.netlify.app
   ```

3. Redeploy.

Realtime features (chat, live submission updates) may fail through Netlify's proxy. Use Option A when those features matter.

## Mixed content

If the site is HTTPS and the API is plain HTTP:

```text
https://vizcoachs.netlify.app  ->  http://149.165.153.148:8090
```

the browser blocks those calls. Use Option A or Option B.

## Jetstream backend

```bash
sudo systemctl status vizcoach
sudo systemctl restart vizcoach
```

The unit file is `deployment/vizcoach.service`. API-only hosting can skip copying the React build into `pb_public`. PocketBase still needs `pb_data` and the `backend` binary.

## Local vs production env

| Environment          | `REACT_APP_POCKETBASE_URL`          |
| -------------------- | ----------------------------------- |
| Local dev            | `http://127.0.0.1:8090`             |
| All-in-one on the VM | `http://149.165.153.148:8090`       |
| Netlify + HTTPS API  | `https://vizcoach-api.duckdns.org`  |
| Netlify + proxy      | `https://vizcoachs.netlify.app`     |

Google OAuth client id and secret are PocketBase settings. They are listed in `.env.example` so they are not pasted into Netlify as `REACT_APP_*` values.

## Redeploy after code changes

- **Frontend:** push to Git so Netlify rebuilds, or run `npm run build` and upload `build/`.
- **Backend or migrations:** SSH to the VM, rebuild `pocketbase/backend` if `main.go` changed, then `sudo systemctl restart vizcoach`. Migrations run on startup.

## All-in-one URL on the VM

While Netlify is the UI, the VM can still serve PocketBase directly:

- API and (if `pb_public` is populated) the app: `http://149.165.153.148:8090`
- Admin: `http://149.165.153.148:8090/_/`
- HTTPS admin and API: `https://vizcoach-api.duckdns.org/_/`
