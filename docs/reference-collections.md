# PocketBase collections

Migrations in `pocketbase/pb_migrations/` are the source of truth. This page is the shape after those files, read in filename order. PocketBase also adds `id`, `created`, and `updated` on these collections.

Rules below are the latest assignment for that collection. A later migration replaces an earlier one.

## users (auth)

| Field | Type | Constraints |
| --- | --- | --- |
| email | email | unique when non-empty (PocketBase auth) |
| username | text | required, unique, pattern `^[a-zA-Z0-9_\-]+$` |
| role | select, single | required. Values: `Student`, `Teacher`, `Admin` |
| name, password, avatar | auth defaults | PocketBase users collection |

| Rule | Expression |
| --- | --- |
| list, view | `@request.auth.role = 'Admin' \|\| @request.auth.id != ''` |
| create | empty (public signup) |
| update | Admin, or the user themselves (`id`) |
| delete | Admin |

`main.go` on create: if `username` is empty or starts with `oauth_`, replace it with a sanitized email local-part (max 24 characters) plus a numeric suffix. If `role` is empty, set `Student`.

## groups

A class. UI label is often "class".

| Field | Type | Constraints |
| --- | --- | --- |
| semester | select, single | required. `Fall`, `Spring`, `Summer` |
| year | number | required, integer, min 2000, max 2100 |
| course | select, single | required. `CSE578` |
| csv | file | required, single, protected, MIME `text/csv` |
| teacherId | relation → users | optional, single |

There is no unique index on course + semester + year. Two teachers can each have CSE578 in the same term. `usergroups` still dedupes a student inside one group.

| Rule | Expression |
| --- | --- |
| list, view | Admin, or Teacher whose `teacherId` is the caller, or a student linked through `usergroups` |
| create | Teacher or Admin |
| update, delete | Admin, or Teacher whose `teacherId` is the caller |

Creating a group with a CSV runs the hooks in `main.go`. See [../pocketbase/README.md](../pocketbase/README.md).

## usergroups

| Field | Type | Constraints |
| --- | --- | --- |
| userId | relation → users | required, single |
| groupId | relation → groups | required, single |

Unique on (`userId`, `groupId`).

| Rule | Expression |
| --- | --- |
| list, view | Teacher, or the student whose `userId` is the caller |

Create, update, and delete were not given custom rules in the migrations that set list and view. Locked-down create depends on PocketBase defaults for an unset rule (only superusers via the admin API). The app inserts these rows from the Go hook, which uses the server API and bypasses collection API rules.

## activities

| Field | Type | Constraints |
| --- | --- | --- |
| title | text | required |
| description | editor | required |
| groupId | relation → groups | required, single |
| scheduled | date | optional. Empty means the UI treats it as posted |
| Image | file | optional, up to 99 files. The field name is capital `Image` |

| Rule | Expression |
| --- | --- |
| list, view | Admin, or Teacher who owns `groupId.teacherId`, or a student in that group's `usergroups` |
| create | Admin, or Teacher and the posted `groupId.teacherId` is the caller |
| update, delete | Admin, or Teacher who owns `groupId.teacherId` |

## units

| Field | Type | Constraints |
| --- | --- | --- |
| title | text | required |
| description | editor | required |
| datasets | file | required, protected, MIME `text/csv`, up to 99 files |
| reference | file | optional, up to 99 files |
| order | number | required, integer, min 1, max 5 |
| activityId | relation → activities | required, single, cascade delete |

| Rule | Expression |
| --- | --- |
| list, view | Admin, or any logged-in user (`@request.auth.id != ''`) |
| create, update, delete | Admin or Teacher |

## submissions

| Field | Type | Constraints |
| --- | --- | --- |
| json | JSON | required. The Vega-Lite spec |
| userId | relation → users | required, single |
| unitId | relation → units | required, single |
| state | select, single | optional. `help` or `submitted`. Empty means in progress. There is no `draft` value |
| attempt | number | required, min 1 |
| score | number | optional, min 0. Teachers can update submissions so they can write a score |
| context | text | optional |

Unique on (`userId`, `unitId`, `attempt`).

| Rule | Expression |
| --- | --- |
| list, view | Admin, or any logged-in user |
| create | caller is a student on the unit's activity group (`@request.auth.id ?= @request.body.unitId.activityId.groupId.usergroups_via_groupId.userId`) |
| update | Teacher, or that same group-membership check against the body |

The Admin migration does not replace the create or update rules.

## comments

| Field | Type | Constraints |
| --- | --- | --- |
| content | editor | required |
| submissionId | relation → submissions | required, single |
| userId | relation → users | required, single |

| Rule | Expression |
| --- | --- |
| list, view | Teacher, or the student who owns `submissionId.userId` |
| create | Teacher, or the student who owns the submission named in the body |

## materials

| Field | Type | Constraints |
| --- | --- | --- |
| groupId | relation → groups | required, single, cascade delete |
| title | text | required |
| type | select, single | required. `Syllabus`, `Presentation`, `Document`, `Video`, `Other` |
| file | file | optional, up to 5 files, max size 52428800 bytes each |

| Rule | Expression |
| --- | --- |
| list, view | Admin, or Teacher who owns the group, or a student in that group |
| create | Admin, or Teacher and the posted group's `teacherId` is the caller |
| update, delete | Admin, or Teacher who owns the group |

## chat_rooms

| Field | Type | Constraints |
| --- | --- | --- |
| name | text | required, length 1–100 |
| type | select, single | required. `group` or `private` |
| description | text | optional, max 500 |
| groupId | relation → groups | optional |
| participants | JSON | required. Array of user ids. List and view use `~` (text contains) against this value |
| createdBy | relation → users | required |
| isActive | bool | required |

Indexes on `type`, `groupId`, and `createdBy`.

| Rule | Expression |
| --- | --- |
| list, view, update | logged-in caller and `participants` contains their id |
| create | any logged-in user |
| delete | `createdBy` is the caller |

## chat_messages

| Field | Type | Constraints |
| --- | --- | --- |
| roomId | relation → chat_rooms | required, cascade delete |
| userId | relation → users | required, cascade delete |
| content | editor | required |
| type | select, single | required. `text` or `system` |
| replyTo | text | optional, max 15 |
| readBy | JSON | optional |

Indexes on `roomId`, `userId`, and `created`.

| Rule | Expression |
| --- | --- |
| list, view, create | any logged-in user |
| update | any logged-in user (set in `1772160786_updated_chat_messages.js`) |
| delete | author, or a Teacher |

Room membership is what limits which rooms a client can open. Message list is not filtered by room on the server. The client queries by `roomId`.

## Related

- Setup and the CSV hook: [../pocketbase/README.md](../pocketbase/README.md)
- Why teacher scope exists: [explanation-architecture.md](explanation-architecture.md)
