# PocketBase setup

The collections, fields, and API rules live in `pb_migrations/`. On startup, PocketBase applies those migrations. Do not recreate the collections by hand in the admin UI if the migrations have already run. The field-by-field reference is [docs/reference-collections.md](../docs/reference-collections.md).

## Installation

The module file is already `go.mod` (`viz-coach-pocketbase`, Go 1.24.4, PocketBase v0.28.3).

```bash
cd pocketbase
go mod tidy
chmod +x *.sh
./dev.sh
```

`./dev.sh` runs `go run main.go --dev serve`. The admin UI is [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/).

Skip `./install.sh` when `go.mod` is already present. That script runs `go mod init backend`, which replaces the module name this repo already uses.

Production binary:

```bash
./build.sh    # CGO_ENABLED=0 go build -o backend
./serve.sh    # ./backend serve --http=0.0.0.0:8090 with the demo CORS origins
```

In the admin UI, set the application name to `VizCoach`.

## SMTP

Password-reset mail is sent when a class CSV creates student accounts, and when a user asks for a reset on the login page. Both paths no-op or fail closed if SMTP is off. The import hook logs a warning and still links the student to the class.

Under **Settings → Mail**:

1. Set **Sender name** to something like `VizCoach Admin`.
2. Set **Sender address** to the address students should see in From.
3. Turn on the SMTP server.

Gmail: host `smtp.gmail.com`, port 587, and an [App Password](https://knowledge.workspace.google.com/kb/how-to-create-app-passwords-000009237) for the account in the username field. Do not put the app password in git or in `REACT_APP_*` variables.

## Google OAuth

Google login is PocketBase OAuth2, configured under **Settings → Auth providers → Google**. Client id and secret stay in PocketBase. `.env.example` lists the names as a reminder. They are not read by the React app.

`main.go` rewrites OAuth usernames that are empty or start with `oauth_` into a sanitized email local-part plus a short suffix, and sets `role` to `Student` when the record has no role yet. The signup form can still send `Teacher` in `createData` before that hook runs. If `role` is already set, the hook leaves it.

Add the frontend origin to the OAuth redirect URLs (local: `http://localhost:3000`, production: the Netlify URL).

## First Admin

`/signup` only offers `Student` and `Teacher`. To get an Admin:

1. Create a user (signup, or the PocketBase users collection).
2. In the admin UI, set that user's `role` to `Admin`.

An Admin can then create other users from `/admin`.

## CSV import

Creating a `groups` record with a `csv` file runs two hooks in `main.go`:

1. Before save: parse the CSV (max 10 MB) and create a `users` row per row that does not already exist. New users get role `Student` and a random password.
2. After save: link each email to the new group through `usergroups`, then send a password-reset email if SMTP is enabled.

CSV columns:

| username | email           | name     |
| -------- | --------------- | -------- |
| asurite  | asurite@asu.edu | John Doe |

`username` must match `^[a-zA-Z0-9_\-]+$`. Email must be unique. `course` values are currently `CSE578`. `semester` is `Fall`, `Spring`, or `Summer`. `year` is an integer from 2000 to 2100. The unique index on `course` + `semester` + `year` was removed so two teachers can each have a class with the same course, term, and year.

The teacher who creates the class should be stored on `groups.teacherId`. List and update rules only show that class to that teacher (and to Admins, and to students in the class).

## What the migrations add beyond the first schema

Treat `pb_migrations/` as the list. The pieces people usually miss when reading an old setup note:

- `users.role` includes `Admin`, plus `Teacher` and `Student`.
- `groups.teacherId` scopes teacher access.
- `activities.Image` is an optional multi-file field.
- `units.reference` is an optional multi-file field. `units.order` is an integer from 1 to 5.
- `submissions` has `attempt` (required, minimum 1), `score` (optional, minimum 0), and `context` (optional text). Uniqueness is `(userId, unitId, attempt)`, so a student can have more than one attempt on a unit. `state` is `help` or `submitted`. An empty state is in-progress work. There is no `draft` select value. The file `1760071800_add_draft_state.js` is empty.
- `materials` holds class files (`Syllabus`, `Presentation`, `Document`, `Video`, `Other`), up to 5 files, 50 MB each.
- `chat_rooms` and `chat_messages` back `/dashboard/chat`. Room list and view require the caller's id to appear in the `participants` JSON. Any logged-in user can create a room or a message. Message delete is the author or a Teacher.

API rules after the Admin migration are in [docs/reference-collections.md](../docs/reference-collections.md).
