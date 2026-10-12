# Routes and roles

The router is `src/routes/AppRouter.tsx`. Roles are `Student`, `Teacher`, and `Admin` (`src/db/types.ts`). `AuthorizedRoute` sends anyone else to the path in `navigateTo`.

Unauthenticated visits to `/dashboard` and `/admin` go through `AuthenticatedRoute` to `/login`, with a `return` query so login can send you back.

| Path | Who | What loads |
| --- | --- | --- |
| `/` | anyone | Redirects to `/dashboard` |
| `/login` | public | Email and password, Google, password reset |
| `/signup` | public | Name, email, password. Role choice is `Student` or `Teacher` |
| `/admin` | `Admin` | User, class, and activity management. Others go to `/dashboard` |
| `/dashboard` | signed in | Redirects to `/dashboard/activities` |
| `/dashboard/activities` | signed in | Activity list (`activitiesLoader`) |
| `/dashboard/activities/add-activity` | `Teacher` | New activity. Needs a class the teacher owns |
| `/dashboard/activities/:activityId/edit-activity` | `Teacher` | Edit activity |
| `/dashboard/activities/:activityId/units` | signed in | Units for one activity |
| `/dashboard/activities/:activityId/add-unit` | `Teacher` | New unit |
| `/dashboard/activities/:activityId/units/:unitId/view` | `Teacher` | Unit preview |
| `/dashboard/activities/:activityId/units/:unitId/edit-unit` | `Teacher` | Edit unit |
| `/dashboard/activities/:activityId/units/:unitId/perform` | `Student` | Vega-Lite work for that unit |
| `/dashboard/activities/:activityId/submissions` | `Teacher` | Submissions for the activity |
| `/dashboard/activities/:activityId/submissions/:studentId` | `Teacher` | One student's submissions |
| `/dashboard/activities/:activityId/student/:studentId/work` | `Teacher` | Student work popup |
| `/dashboard/groups` | `Teacher` | Class list |
| `/dashboard/groups/add-group` | `Teacher` | CSV class import |
| `/dashboard/groups/:groupId` | `Teacher` | Students in that class |
| `/dashboard/chat` | signed in | Chat |
| `/dashboard/orchestration` | `Teacher` | Orchestration view. Loader fetches activities and groups |
| anything else under `/dashboard` | signed in | Unknown activity paths redirect to `/dashboard`. Other unknown dashboard paths render not-found |
| anything else | public | Not-found page |

`Admin` is not included in the `allowedRoles` arrays for teacher or student pages. An Admin who is only an Admin is sent to `/dashboard` from those routes, and can still use `/admin`. A person who needs both the teacher UI and the admin UI needs the role the route checks. The select field stores one role.

Frontend names used in some components: a group is also called a class, an activity an assignment, and a unit a task. The PocketBase collection names stay `groups`, `activities`, and `units`.

Related: [reference-collections.md](reference-collections.md), [explanation-architecture.md](explanation-architecture.md).
