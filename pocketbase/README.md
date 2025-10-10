# Pocketbase Setup Steps

Follow these steps to setup Pocketbase database for the application.

## Installation

> [!NOTE]
> Ensure that all scripts in the `pocketbase` directory have execution permissions. If you are not sure, run the `chmod +x *.sh` command inside the `pocketbase` directory.

1. Follow the [PocketBase documentation](https://pocketbase.io/docs/go-overview/) and install Go on your system.
2. Install the project's dependency using the [install.sh](install.sh) script.
3. Run the development server using the [dev.sh](dev.sh) script.
4. Build production version of the server using [build.sh](build.sh) script and serve it using the [serve.sh](serve.sh) script.
5. Set the application name in the settings tab to `VizCoach`.

## SMTP Setup

All these settings are under the Mail settings.

1. Set `Sender name` to somthing like `VizCoach Admin` or `[Admin name] via VizCoach`. All emails will be sent under this name.
2. Set `Sender email` to admin/professor's email. All emails will be in the `from` section of the email.
3. Enable the `SMTP mail server` option. **Note:** You need to configure the SMTP mail server to send password reset email to students.

> [!TIP]
> To use Gmail's SMTP mail server, set `SMTP server host` to `smtp.gmail.com`. You can use any gmail/asu email address as `username` under this setting. For password, you will need to create an `App Password` for the Google Account you populated in the `username` field. Follow [this guide](https://knowledge.workspace.google.com/kb/how-to-create-app-passwords-000009237) to create an App Password for your Google Account.

## Users Auth Collection

1. Add a new field called `role` to the default `users` collection of type `Select`. This field should be set to `non-empty` and `single-valued`. Values for the select `Teacher` and `Student`.
2. Add a new field called `username` to the default `users` collection of type `Plain Text`. This field should be set to `non-empty` and validation pattern `^[a-zA-Z0-9_\-]+$`.
3. Add an unique constraint on the `username` field ensuring one user per username.
4. Update `List/Search Rule` and `View rule` in the `API Rules` for the `users` collection to `id = @request.auth.id || @request.auth.role = 'Teacher'`. This step will ensure that teachers can view student's records, apart from the requesting user.

## Groups Collection

> [!NOTE]
> Before a group record is inserted in the database, the backend server will parse the associated `csv` file and try to create users from it. For the CSV file, please follow the following specifications.
>
> | username | email           | name     |
> | -------- | --------------- | -------- |
> | asurite  | asurite@asu.edu | John Doe |
>
> To understand how this works, refer to the [main.go](main.go) file in this directory.

1.  Create a new collection called `groups`. This collection will store all student groups.
2.  Add fields `semester`, `year`, `course`, and `csv` to the `groups` collection.
3.  The field `semester` in the `groups` collection is of type `Select`. This field should be set to `non-empty` and `single-valued`. Values for the select `Fall`, `Spring`, and `Summer`.
4.  The field `year` in the `groups` collection is of type `Number`. This field should be set to `non-zero` and `no-decimal`. Values should be between `2000` and `2100`.
5.  The field `course` in the `groups` collection is of type `Select`. This field should be set to `non-empty` and `single-valued`. Values for the select `CSE578`.
6.  The field `csv` in the `groups` collection is of type `File`. This field should be set to `non-empty`, `protected`, and `single-valued`. Allowed mime types include `text/csv`.
7.  Add an unique constraint on fields `course`, `semester`, and `year`, ensuring one group per semester per course per year.
8.  Update the `List/Search Rule` and `View rule` in the `API Rules` for the `groups` collection to the following value. This step will ensure that only teachers and associated students can view student groups.

```
// Teachers can access all groups
@request.auth.role = 'Teacher' ||
// Students can only access their associated group
@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId
```

9.  Update the `Create rule`, `Update rule`, and `Delete rule` in the `API Rules` for the `groups` collection to the following value. This step will ensure that only teachers can create, update, and delete groups.

```
@request.auth.role = 'Teacher'
```

## User-Groups Collection

1.  Create a new collection called `usergroups`. This collection will store the relationship between `users` and `groups`.
2.  Add fields `userId` and `groupId` to the `usergroups` collection.
3.  The field `userId` in the `usergroups` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `users` collection.
4.  The field `groupId` in the `usergroups` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `groups` collection.
5.  Add an unique constraint on fields `userId` and `groupId`, ensuring one user belongs to one group.
6.  Update the `List/Search Rule` and `View rule` in the `API Rules` for the `usergroups` collection to the following value. This step will ensure that only teachers and associated students can view student groups.

```
// Teachers can access all usergroups
@request.auth.role = 'Teacher' ||
// Students can only access their associated usergroup
@request.auth.id ?= @collection.usergroups.userId
```

## Activities Collection

1.  Create a new collection called `activities`.
2.  Add fields `title`, `description`, `groupId`, and `scheduled` to the `activities` collection.
3.  The field `title` in the `activities` collection is of type `Plain Text`. This field should be set to `non-empty`.
4.  The field `description` in the `activities` collection is of type `Rich Text`. This field should be set to `non-empty`.
5.  The field `groupId` in the `activities` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `groups` collection.
6.  The field `scheduled` in the `activities` collection is of type `DateTime`. This field can be empty, meaning activities will post immediately.
7.  Update the `List/Search Rule` and `View rule` in the `API Rules` for the `activities` collection to the following value. This step will ensure that only teachers and associated students can view activities.

```
// Teacher can access all the activities
@request.auth.role = 'Teacher' ||
// Students should have only access if in associated group
@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId
```

8.  Update the `Create rule`, `Update rule`, and `Delete rule` in the `API Rules` for the `activities` collection to the following value. This step will ensure that only teachers can create, update, and delete activities.

```
@request.auth.role = 'Teacher'
```

## Units Collection

1.  Create a new collection called `units`.
2.  Add fields `title`, `description`, `datasets`, `order`, and `activityId` to the `units` collection.
3.  The field `title` in the `units` collection is of type `Plain Text`. This field should be set to `non-empty`.
4.  The field `description` in the `units` collection is of type `Rich Text`. This field should be set to `non-empty`.
5.  The field `datasets` in the `units` collection is of type `File`. This field should be set to `non-empty`, `protected`, and `multi-valued`. Allowed mime types include `text/csv`.
6.  The field `order` in the `units` collection is of type `Number`. This field should be set to `non-zero` and `no-decimals`. Values should be between `1` and `5`.
7.  The field `activityId` in the `units` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `activities` collection.
8.  Update the `List/Search Rule` and `View rule` in the `API Rules` for the `units` collection to the following value. This step will ensure that only teachers and associated students can view activities.

```
// Teacher can access all the units
@request.auth.role = 'Teacher' ||
// Students should have only access if associated with activity
@request.auth.id ?= @collection.units.activityId.groupId.usergroups_via_groupId.userId
```

9.  Update the `Create rule`, `Update rule`, and `Delete rule` in the `API Rules` for the `units` collection to the following value. This step will ensure that only teachers can create, update, and delete units.

```
@request.auth.role = 'Teacher'
```

## Submissions Collection

1.  Create a new collection called `submissions`.
2.  Add fields `json`, `unitId`, `userId`, and `state` to the `submissions` collection.
3.  The field `json` in the `submissions` collection is of type `JSON`. This field should be set to `non-empty`. Value of this field will store student's Vegalite solution.
4.  The field `unitId` in the `submissions` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `units` collection.
5.  The field `userId` in the `submissions` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `users` collection.
6.  The field `state` in the `submissions` collection is of type `Select`. Values for the select `help` and `submitted`. An `empty` state means that student is working on thier submission.
7.  Add an unique constraint on fields `userId` and `unitId`, ensuring one submission per unit per student.
8.  Update the `List/Search Rule` and `View rule` in the `API Rules` for the `submissions` collection to the following value. This step will ensure that only teachers and owning students can view submissions.

```
// Teacher can access all the submissions
@request.auth.role = 'Teacher' ||
// Students should have only access their submissions
@request.auth.id ?= @collection.submissions.userId
```

9.  Update the `Create rule` and `Update rule` in the `API Rules` for the `submissions` collection to the following value. This step will ensure that only students can create and update submissions.

```
@request.auth.id ?= @request.body.unitId.activityId.groupId.usergroups_via_groupId.userId
```

## Comments Collection

1.  Create a new collection called `comments`.
2.  Add fields `content`, `submissionId`, and `userId` to the `comments` collection.
3.  The field `content` in the `comments` collection is of type `Rich Text`. This field should be set to `non-empty`. Value of this field will store comments' contents.
4.  The field `submissionId` in the `comments` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `submissions` collection.
5.  The field `userId` in the `submissions` collection is of type `Relation`. This field should be set to `non-empty` and `single-valued`. Values for this field maps to the `users` collection.
6.  Update the `List/Search Rule` and `View rule` in the `API Rules` for the `comments` collection to the following value. This step will ensure that only teachers and owning students can view comments.

```
// Teacher can access all the submissions' comments
@request.auth.role = 'Teacher' ||
// Students should have only access their submissions' comments
@request.auth.id ?= @collection.comments.submissionId.userId
```

7. Update the `Create rule` in the `API Rules` for the `comments` collection to the following value. This step will ensure that only teachers and students with its submission can create comments.

```
// Teacher can access all the submissions' comments
@request.auth.role = 'Teacher' ||
// Students should have only access their submissions' comments
@request.auth.id ?= @request.body.submissionId.userId
```
