# Environment variables and scripts

## Environment variables

Copy `.env.example` to `.env` for local React. Netlify reads the same name from the site's environment variables. Create React App only exposes variables that start with `REACT_APP_`, and only at build or `npm start` time.

| Name | Where it is read | Values |
| --- | --- | --- |
| `REACT_APP_POCKETBASE_URL` | `src/db/client.ts` (`new Pocketbase(...)`) | No trailing slash. Local: `http://127.0.0.1:8090`. Public API: `https://vizcoach-api.duckdns.org`. Netlify proxy mode: the Netlify origin, for example `https://vizcoachs.netlify.app` |
| `GOOGLE_OAUTH_CLIENT_ID` | not read by the React app | Reminder in `.env.example`. Paste into PocketBase → Settings → Auth providers → Google |
| `GOOGLE_OAUTH_CLIENT_SECRET` | not read by the React app | Same as the client id. Do not put this in Netlify |

`netlify.toml` sets `NODE_VERSION` to `20` for the Netlify build. That is not a `REACT_APP_` variable.

## npm scripts (repo root)

| Script | Command |
| --- | --- |
| `npm start` | `react-scripts start` (port 3000) |
| `npm run build` | `react-scripts build` → `build/` |
| `npm test` | `react-scripts test` |
| `npm run format:check` | `prettier --check .` |
| `npm run format:fix` | `prettier --write .` |
| `prepare` | `husky install` (runs on `npm install`) |

## pocketbase scripts

Run them from `pocketbase/` after `chmod +x *.sh` if the executable bit is missing.

| Script | What it runs | Use it when |
| --- | --- | --- |
| `dev.sh` | `go run main.go --dev serve` | Local API on port 8090 |
| `build.sh` | `CGO_ENABLED=0 go build -o backend` | Producing the `backend` binary |
| `serve.sh` | `./backend serve --http=0.0.0.0:8090` with origins `https://vizcoachs.netlify.app`, `https://vizcoach-api.duckdns.org`, `http://localhost:3000` | A foreground production process with the demo CORS list |
| `install.sh` | `go mod init backend` then `go mod tidy` | Do not use on this repo. `go.mod` already exists |

Prefer `go mod tidy` in `pocketbase/` instead of `install.sh`.

## deployment files

| File | Role |
| --- | --- |
| `netlify.toml` | Netlify build command, publish dir, Node 20 |
| `public/_redirects` | SPA fallback. Optional commented `/api/*` proxy to `http://149.165.153.148:8090` |
| `deployment/vizcoach.service` | systemd unit. User `exouser`, binary `pocketbase/backend`, port 8090, same origins as `serve.sh` |
| `deployment/Caddyfile.example` | `vizcoach-api.duckdns.org` → `127.0.0.1:8090` |

There is no `deployment/deploy.sh` and no launchd plist.

## Related

- Deploy steps: [howto-deploy-netlify-jetstream.md](howto-deploy-netlify-jetstream.md)
- Host write-up: [../DEPLOYMENT.md](../DEPLOYMENT.md) and [../deployment/NETLIFY.md](../deployment/NETLIFY.md)
