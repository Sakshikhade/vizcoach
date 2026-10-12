# How to deploy the Netlify frontend and the Jetstream API

You will serve the React app at `https://vizcoachs.netlify.app` and PocketBase at `https://vizcoach-api.duckdns.org`.

## Prerequisites

- A Netlify site connected to this repo. Build settings are already in `netlify.toml`: `npm run build`, publish `build`, Node 20.
- SSH access to the Jetstream VM that should run PocketBase.
- DNS for `vizcoach-api.duckdns.org` pointing at that VM.
- Go 1.24.4 or newer on the VM.

The longer notes on mixed content and the Netlify `/api/*` proxy are in [../deployment/NETLIFY.md](../deployment/NETLIFY.md). This guide is the HTTPS API path (Option A). Use that path if chat or live submission updates matter.

## Steps

1. On the VM, build the binary from a checkout of this repo:

   ```bash
   cd /home/exouser/viz-coach/pocketbase
   go mod tidy
   ./build.sh
   ```

   `./build.sh` runs `CGO_ENABLED=0 go build -o backend`. `deployment/vizcoach.service` expects that path and user. If your checkout lives somewhere else, edit the unit's `WorkingDirectory` and `ExecStart` before installing it.

2. Install and start the service:

   ```bash
   sudo cp /home/exouser/viz-coach/deployment/vizcoach.service /etc/systemd/system/vizcoach.service
   sudo systemctl daemon-reload
   sudo systemctl enable --now vizcoach
   sudo systemctl status vizcoach
   ```

   The unit listens on `0.0.0.0:8090` and allows origins `https://vizcoachs.netlify.app`, `https://vizcoach-api.duckdns.org`, and `http://localhost:3000`.

3. Put Caddy in front of port 8090:

   ```bash
   sudo apt install caddy
   sudo cp /home/exouser/viz-coach/deployment/Caddyfile.example /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```

   The example file proxies `vizcoach-api.duckdns.org` to `127.0.0.1:8090`. Open the VM security group for ports 80 and 443 so Caddy can get a certificate.

4. In Netlify → Site settings → Environment variables, set:

   ```bash
   REACT_APP_POCKETBASE_URL=https://vizcoach-api.duckdns.org
   ```

   Trigger a new deploy. Create React App inlines this value at build time, so an env change without a rebuild does nothing.

5. Leave `public/_redirects` on the SPA rule only (`/* /index.html 200`). Do not uncomment the `/api/*` proxy line when the API has its own hostname.

6. In PocketBase admin at `https://vizcoach-api.duckdns.org/_/`, set the application name to `VizCoach`, configure SMTP, and add the Netlify URL to the Google OAuth redirect list if Google login is enabled.

## Verification

- `curl -I https://vizcoach-api.duckdns.org/api/health` returns a PocketBase health response (HTTP 200).
- `https://vizcoachs.netlify.app/login` loads, and a login request in the browser network panel goes to `vizcoach-api.duckdns.org`, not to `localhost`.
- Chat at `/dashboard/chat` stays connected. If messages never arrive live, you are probably on the Netlify proxy path. Switch back to the DuckDNS URL and redeploy.

## Troubleshooting

- **Browser console says mixed content.** The Netlify env still points at `http://…:8090`. Set the `https://vizcoach-api.duckdns.org` URL and redeploy.
- **Login works locally and fails on Netlify with a CORS error.** The request origin is not in `--origins`. The unit file lists `https://vizcoachs.netlify.app`. A different Netlify subdomain needs that origin added to `ExecStart`, then `sudo systemctl daemon-reload && sudo systemctl restart vizcoach`.
- **Migrations did not apply.** Restart `vizcoach` after pulling new files under `pb_migrations/`. PocketBase applies them on startup. The log is `/tmp/viz-coach.err`.

Env vars and scripts: [reference-env-and-scripts.md](reference-env-and-scripts.md).
