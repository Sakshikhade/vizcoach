# How to import students from a CSV

You will create a class (`groups` row) whose CSV creates Student accounts and links them to that class.

## Prerequisites

- The app is running locally or against a PocketBase you can log into. See [tutorial-first-class.md](tutorial-first-class.md).
- You are signed in as a Teacher or an Admin.
- SMTP is configured if you want each new student to get a password-reset email. Setup is in [../pocketbase/README.md](../pocketbase/README.md). Without SMTP, accounts are still created and linked. The server logs a warning and skips the email.

## Steps

1. Make a UTF-8 CSV with a header row and these columns:

   ```csv
   username,email,name
   jdoe1,jdoe1@example.edu,Jane Doe
   ```

   `username` must match `^[a-zA-Z0-9_\-]+$`. `email` must not already belong to another user if you expect a new account. Existing emails are skipped at account creation and still linked to the class when the address matches. The file must be `text/csv` and at most 10 MB.

2. Sign in and open **Groups**, or go directly to `/dashboard/groups/add-group`.

3. Set:

   - **Course:** `CSE578` (the only value in the select field)
   - **Semester:** `Spring`, `Summer`, or `Fall`
   - **Year:** this year or later (the form rejects a year before the current calendar year)
   - **CSV:** the file from step 1

4. Save.

   The server hook in `pocketbase/main.go` creates missing Student users with a random password, then writes `usergroups` rows, then sends password-reset mail when SMTP is on. The UI should return you to the class list. Open the class to see the students.

5. `createGroup` in `src/db/client.ts` sets `groups.teacherId` to the signed-in user. Activity and class list rules only return that class to that teacher (plus Admins, and students linked in `usergroups`). If you created the row in the PocketBase admin UI and left `teacherId` empty, the teacher UI will not list it. Set `teacherId` to the teacher's user id.

## Verification

- PocketBase admin → `users`: one row per new email, `role` = `Student`.
- `usergroups`: one row per student for this `groupId`. A second import of the same pair does not create a duplicate (`userId` + `groupId` is unique).
- As that student, request a password reset from `/login` if the import email did not arrive, then sign in and open `/dashboard/activities`.

## Troubleshooting

- **Save fails before the record exists.** The CSV parse runs on the create request. A non-CSV body, a file over 10 MB, or columns the parser cannot map (`username`, `email`, `name`) returns an error and does not leave a half-written group from this hook. Check the PocketBase terminal log.
- **Students exist but got no email.** SMTP is disabled or the sender was rejected. Accounts still exist. Use **Forgot password** on `/login`, or set a password in the PocketBase admin UI.
- **The class is invisible to the teacher who created it.** `teacherId` is empty or points at someone else. List rule: Admin, or Teacher with `teacherId = @request.auth.id`, or a student linked through `usergroups`.
- **Two teachers need the same course and term.** That is allowed. The unique index on course + semester + year was removed in `1773791690_add_teacher_id_to_groups.js`.

Field types and API rules: [reference-collections.md](reference-collections.md).
