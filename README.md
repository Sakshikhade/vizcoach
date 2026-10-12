# VizCoach

VizCoach is a classroom toolkit for visualization education. Instructors create activities and units, students build Vega-Lite charts from class datasets, and teachers review submissions, scores, and live class state.

## Project description

The app covers two jobs:

1. Give students a place to practice visualization design on real datasets.
2. Give instructors a way to orchestrate that work in class: groups, activities, units, submissions, comments, chat, and an orchestration view.

Accounts have one of three roles: `Student`, `Teacher`, or `Admin`. Public signup offers Student and Teacher. Admin is assigned in PocketBase or by an existing Admin.

## Documentation

| Doc | What it is |
| --- | --- |
| [docs/README.md](docs/README.md) | Index of the deeper docs |
| [docs/tutorial-first-class.md](docs/tutorial-first-class.md) | Local setup through a first class |
| [docs/howto-import-students.md](docs/howto-import-students.md) | CSV student import |
| [docs/howto-deploy-netlify-jetstream.md](docs/howto-deploy-netlify-jetstream.md) | Public demo deploy |
| [docs/reference-routes.md](docs/reference-routes.md) | Routes and who can open them |
| [docs/reference-collections.md](docs/reference-collections.md) | PocketBase collections |
| [docs/reference-env-and-scripts.md](docs/reference-env-and-scripts.md) | Env vars and scripts |
| [docs/explanation-architecture.md](docs/explanation-architecture.md) | How the pieces fit |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Hosting options |
| [deployment/NETLIFY.md](deployment/NETLIFY.md) | Netlify frontend and Jetstream API |
| [pocketbase/README.md](pocketbase/README.md) | Backend setup, SMTP, and CSV format |

## Getting started

### Prerequisites

- Node.js 20 (the Netlify build pins 20 in `netlify.toml`)
- npm
- Go 1.24.4 or newer (see `pocketbase/go.mod`)
- Git

### Installation and setup

#### 1. Clone the repository

```bash
git clone https://github.com/Sakshikhade/vizcoach.git
cd vizcoach
```

#### 2. Install frontend dependencies

```bash
cp .env.example .env
npm install
```

Leave `REACT_APP_POCKETBASE_URL=http://127.0.0.1:8090` for local development.

#### 3. Set up PocketBase

`pocketbase/go.mod` is already in the repo. Do not run `pocketbase/install.sh` on a fresh clone: that script runs `go mod init backend` and fights the existing module name.

```bash
cd pocketbase
go mod tidy
chmod +x *.sh
./dev.sh
```

The dev server listens on port 8090. On first start, open [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/) and create the superuser. Migrations in `pocketbase/pb_migrations/` create the collections. Set the application name to `VizCoach`. SMTP setup is in [pocketbase/README.md](pocketbase/README.md).

#### 4. Start the React app

In a second terminal, from the repo root:

```bash
npm start
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- PocketBase admin: [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)

Sign up at `/signup` as a Teacher, then follow [docs/tutorial-first-class.md](docs/tutorial-first-class.md).

### Production build

```bash
npm run build
cd pocketbase
CGO_ENABLED=0 go build -o backend
./backend serve --http=0.0.0.0:8090
```

`pocketbase/build.sh` and `pocketbase/serve.sh` wrap those last two commands. `serve.sh` also sets the CORS origins used by the public demo. Hosting steps are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Features

### Teachers

- Create classes (groups) for a course, semester, and year, and import students from CSV
- Create activities and ordered units with CSV datasets and reference files
- Review submissions, including multiple attempts, scores, and comments
- Watch class state in the orchestration view
- Chat with students
- Share class materials (syllabus, slides, documents, video, other)

### Students

- Build Vega-Lite specs in the visual builder or the JSON editor
- Browse the unit's CSV datasets
- Save in-progress work, raise a hand (`help`), and submit
- Read teacher comments
- Chat with classmates and the teacher

### Admins

- Open `/admin` to create users, bulk-add users, and manage classes
- See records across teachers. Teachers only see classes where `groups.teacherId` is their user id

### Shared

- Email and password login, password reset, and Google OAuth (configured in PocketBase, not in the React env)
- Role checks on routes: Student, Teacher, Admin
- PocketBase realtime for live updates. Chat and live submission updates need a direct API connection, not an HTTP-only proxy

## Technology stack

### Frontend

- React 18.3 and TypeScript 4.9
- Create React App (`react-scripts` 5)
- Material UI 5
- React Router 6
- Vega, Vega-Lite 5, and react-vega
- D3 7
- Monaco Editor
- TipTap (`mui-tiptap`)
- PocketBase JavaScript SDK 0.26

### Backend

- PocketBase server v0.28.3 (Go module in `pocketbase/go.mod`)
- Go 1.24.4
- SQLite (PocketBase's embedded database)
- Custom hooks in `pocketbase/main.go` for CSV student import and OAuth username defaults

The JavaScript SDK and the Go server are different versions. The SDK talks to the HTTP API. Schema changes ship as JavaScript migrations under `pocketbase/pb_migrations/`.

### Development tools

- Prettier, Husky, Sass
- Jest and Testing Library (Create React App defaults)
- Netlify CLI for the frontend host

## Contributing

Changes should stay aligned with classroom use: a teacher can run an activity, a student can submit a chart, and an admin can manage accounts. Schema changes belong in a new file under `pocketbase/pb_migrations/`.

**Repository:** [https://github.com/Sakshikhade/vizcoach](https://github.com/Sakshikhade/vizcoach)

## Support

Start with [docs/README.md](docs/README.md). Backend setup details are in [pocketbase/README.md](pocketbase/README.md). Deploy details are in [DEPLOYMENT.md](DEPLOYMENT.md).
