# Run VizCoach locally and sign in as a teacher

You will have PocketBase on port 8090, the React app on port 3000, and a Teacher account that can open the dashboard.

## What you'll need

- Node.js 20 and npm
- Go 1.24.4 or newer
- Git
- A browser

Details for SMTP and Google login can wait. This tutorial uses email and password.

## Step 1: Start PocketBase

```bash
git clone https://github.com/Sakshikhade/vizcoach.git
cd vizcoach/pocketbase
go mod tidy
chmod +x *.sh
./dev.sh
```

`./dev.sh` runs `go run main.go --dev serve`. Leave that terminal open.

Open [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/). On a brand-new `pb_data` directory, PocketBase asks you to create a superuser. That superuser is the database admin. It is not the same as an in-app `Admin` role.

If `go mod tidy` fails, confirm `go version` is at least 1.24.4. Do not run `./install.sh`. It runs `go mod init backend` and clashes with the module already in `go.mod`.

## Step 2: Start the frontend

In a second terminal, from the repo root:

```bash
cp .env.example .env
npm install
npm start
```

`.env.example` sets `REACT_APP_POCKETBASE_URL=http://127.0.0.1:8090`. Create React App reads that at startup. If you change it later, stop `npm start` and start it again.

Open [http://localhost:3000](http://localhost:3000). You should land on the login page (the app redirects `/` to `/dashboard`, and the auth gate sends you to `/login`).

## Step 3: Create a Teacher account

1. Open [http://localhost:3000/signup](http://localhost:3000/signup).
2. Choose **Teacher**.
3. Enter a name, email, and password, and submit.

You should land on `/dashboard`, which redirects to `/dashboard/activities`. The activities list is empty until you add a class and an activity.

Signup does not offer Admin. To make an Admin, open the PocketBase admin UI, edit that user, and set `role` to `Admin`. Then sign in again and open `/admin`.

## Step 4: Confirm the API is the local server

In PocketBase admin, **Collections** should list `groups`, `usergroups`, `activities`, `units`, `submissions`, `comments`, `materials`, `chat_rooms`, and `chat_messages`. Those come from `pocketbase/pb_migrations/`. If they are missing, the server did not start from this repo's `pocketbase/` directory.

## What you built

A local stack: React on 3000, PocketBase on 8090, and a Teacher who can open the dashboard. Next, add a class with a CSV: [howto-import-students.md](howto-import-students.md). Routes are listed in [reference-routes.md](reference-routes.md).
