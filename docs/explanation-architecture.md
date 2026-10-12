# Why VizCoach is split this way

A class has many students submitting charts at once, and more than one teacher may use the same server. The app keeps the UI as a static React build and keeps accounts, files, and live updates in PocketBase.

## The problem

A single hosted website that also owns the database forces every frontend deploy to restart the API. A shared database with "every teacher sees every class" leaks one course's roster into another teacher's screen. Student passwords cannot be the CSV itself, or the roster file becomes a credential dump.

## The approach

```text
Browser (React, Create React App)
    |  REST + PocketBase realtime
PocketBase on :8090  (Go server, SQLite in pb_data)
    |  pb_migrations/*.js on startup
    |  main.go hooks on user create and group create
```

**Two hosts in production.** Netlify serves `build/`. The VM runs `backend` under systemd, and Caddy terminates TLS for `vizcoach-api.duckdns.org`. The browser is told where the API is through `REACT_APP_POCKETBASE_URL`, which is compiled into the JavaScript. That is why a Netlify env change needs a rebuild.

Realtime (chat, live submission state) is a PocketBase subscription. An HTTP reverse proxy that only forwards `/api/*` does not carry that stream reliably, so the supported public setup is a hostname that points straight at Caddy.

**Three roles, one field.** `users.role` is a single select: `Student`, `Teacher`, `Admin`. Routes in `src/routes/AppRouter.tsx` check that string. Signup can set Student or Teacher because those users self-serve. Admin is assigned in PocketBase (or later by an Admin on `/admin`) so a public form cannot grant it.

**Teachers see their classes.** `groups.teacherId` points at the teacher who owns the class. Group and activity API rules require that id for Teacher list, update, and delete. Admins skip that check. Students get in through `usergroups`. The old unique key on course + semester + year was removed so two teachers can both run CSE578 in the same term. The cost is that "CSE578 Spring 2026" is no longer a single row. The teacher id is what distinguishes them.

**CSV import stays on the server.** The browser uploads the file as part of creating a `groups` record. `OnGroupCreateRequest` creates Student users with a random password before the group row is stored. `OnGroupAfterCreateSuccess` writes `usergroups` and sends a reset email. The password never goes back to the teacher. If SMTP is down, the account still exists and the email is skipped with a log line. The student uses Forgot password, which calls PocketBase's own reset mail and also needs SMTP.

**Attempts are rows, not overwrites.** `submissions` is unique on user, unit, and `attempt`. A resubmit can insert another attempt instead of destroying the previous JSON. `state` is only `help` or `submitted`. Empty state is the in-progress chart. The UI sometimes labels that "draft". The unused migration `1760071800_add_draft_state.js` does not add a value.

**OAuth usernames.** Google signup goes through PocketBase OAuth2. The client may send a temporary `oauth_` username. `OnUserBeforeCreate` replaces that with a short name derived from the email so the users collection's username pattern stays satisfied.

## Trade-offs

- The JavaScript SDK (`pocketbase` 0.26) and the Go server (v0.28.3) are different releases. They only need to agree on the HTTP API. A server upgrade can still break a call the SDK sends. Pin both when you upgrade.
- Teacher scoping is an API rule, not a second database. A superuser in the PocketBase admin UI sees every row. That UI is the break-glass path.
- Several list rules (units, submissions, users, chat messages) allow any logged-in user to list. Teacher isolation is strict on `groups` and `activities`. The client is expected to query the rows it needs. A student who can guess another record id may still view units or submissions under those rules.
- `pb_public` can serve the React build from PocketBase for a LAN install. The public demo does not need that copy, and forgetting which copy is live is a common way to test the wrong UI.
- Chat message update is allowed for any logged-in user. Delete is limited to the author or a Teacher. Room list is limited to participants.

## Alternatives that were dropped

- **Mac Mini launchd plus `deployment/deploy.sh`.** Those files are not in the repo. LAN hosting uses `npm run build`, a copy into `pb_public`, and `pocketbase/build.sh`. The VM uses `deployment/vizcoach.service`.
- **One group per course per term.** The unique index was removed when `teacherId` was added, specifically so two teachers can teach the same course code.
- **Netlify as the API.** Documented as Option B in `deployment/NETLIFY.md` and left commented in `public/_redirects` because subscriptions break.

Related reference: [reference-collections.md](reference-collections.md), [reference-routes.md](reference-routes.md).
