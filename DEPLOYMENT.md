# Deployment

## Netlify + Jetstream (public demo)

Host the React app on Netlify and PocketBase on the Jetstream VM. Step-by-step commands are in [docs/howto-deploy-netlify-jetstream.md](docs/howto-deploy-netlify-jetstream.md). Hostnames, env vars, and the mixed-content rules are in [deployment/NETLIFY.md](deployment/NETLIFY.md).

This app is Create React App. The API URL is `REACT_APP_POCKETBASE_URL`. PocketBase listens on port **8090**.

Current public pieces, matching `deployment/vizcoach.service` and `deployment/Caddyfile.example`:

- Frontend: `https://vizcoachs.netlify.app`
- API: `https://vizcoach-api.duckdns.org` (Caddy on the VM proxies to `127.0.0.1:8090`)

## All-in-one on a Linux VM (systemd)

`deployment/vizcoach.service` is the unit that runs the API. It expects:

- User `exouser`
- Working directory `/home/exouser/viz-coach/pocketbase`
- Binary `/home/exouser/viz-coach/pocketbase/backend`
- HTTP `0.0.0.0:8090`
- CORS origins `https://vizcoachs.netlify.app`, `https://vizcoach-api.duckdns.org`, and `http://localhost:3000`

Install on the VM (adjust paths if the checkout is elsewhere):

```bash
sudo cp deployment/vizcoach.service /etc/systemd/system/vizcoach.service
sudo systemctl daemon-reload
sudo systemctl enable --now vizcoach
sudo systemctl status vizcoach
```

Logs: `/tmp/viz-coach.out` and `/tmp/viz-coach.err`.

HTTPS in front of that port is `deployment/Caddyfile.example`:

```bash
sudo apt install caddy
sudo cp deployment/Caddyfile.example /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

The example site block is `vizcoach-api.duckdns.org` reverse-proxying to `127.0.0.1:8090`. Point that DNS name at the VM before reloading Caddy so certificate issuance can succeed.

Build the binary on the VM from `pocketbase/`:

```bash
go mod tidy
./build.sh
```

Restart after a binary or migration change:

```bash
sudo systemctl restart vizcoach
```

## All-in-one on a private LAN

Use this when every browser is on the same network as the machine running PocketBase. There is no `deployment/deploy.sh` and no launchd plist in this repo. The supported commands are the ones below.

1. On the server, set the frontend env to the server's LAN address:

   ```ini
   REACT_APP_POCKETBASE_URL=http://192.0.2.10:8090
   ```

   macOS: `ipconfig getifaddr en0` (Wi-Fi) or `ipconfig getifaddr en1` (Ethernet). A DHCP reservation keeps that address stable.

2. From the repo root, build the React app and copy it into PocketBase's static dir:

   ```bash
   npm install
   npm run build
   rm -rf pocketbase/pb_public
   cp -R build pocketbase/pb_public
   ```

3. Build and serve:

   ```bash
   cd pocketbase
   ./build.sh
   ./backend serve --http=0.0.0.0:8090 --origins=http://192.0.2.10:8090
   ```

   `./serve.sh` hardcodes the Netlify and DuckDNS origins. On a LAN-only host, pass `--origins` yourself so the browser origin matches the URL students type.

4. Open `http://192.0.2.10:8090`. The admin UI is `http://192.0.2.10:8090/_/`.

PocketBase serves `pb_public` for any GET that is not already a route (`main.go`). The React build must exist before you serve, or the UI will not load from that host. API-only hosting (Netlify for the UI) can leave `pb_public` unused. PocketBase still needs `pb_data`.

## Local development

See [README.md](README.md). Frontend on port 3000, PocketBase on port 8090, `REACT_APP_POCKETBASE_URL=http://127.0.0.1:8090`.
