/// <reference path="../pb_data/types.d.ts" />
migrate(
    (app) => {
        // ── 1. Add 'Admin' to the users `role` select field ──────────────────
        // We only update the specific field by ID, not the whole schema
        const users = app.findCollectionByNameOrId("_pb_users_auth_");
        const roleField = users.fields.getByName("role");
        if (roleField) {
            roleField.values = ["Student", "Teacher", "Admin"];
            app.save(users);
        }

        // ── 2. groups: Admin bypass rules ────────────────────────────────────
        const groups = app.findCollectionByNameOrId("groups");
        groups.listRule =
            "@request.auth.role = 'Admin' ||\n" +
            "(@request.auth.role = 'Teacher' && teacherId = @request.auth.id) ||\n" +
            "@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId";
        groups.viewRule =
            "@request.auth.role = 'Admin' ||\n" +
            "(@request.auth.role = 'Teacher' && teacherId = @request.auth.id) ||\n" +
            "@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId";
        groups.createRule =
            "@request.auth.role = 'Teacher' || @request.auth.role = 'Admin'";
        groups.updateRule =
            "@request.auth.role = 'Admin' ||\n" +
            "(@request.auth.role = 'Teacher' && teacherId = @request.auth.id)";
        groups.deleteRule =
            "@request.auth.role = 'Admin' ||\n" +
            "(@request.auth.role = 'Teacher' && teacherId = @request.auth.id)";
        app.save(groups);

        // ── 3. activities: Admin bypass ───────────────────────────────────────
        const activities = app.findCollectionByNameOrId("activities");
        activities.listRule =
            "@request.auth.role = 'Admin' ||\n" +
            "(@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id) ||\n" +
            "@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId";
        activities.viewRule =
            "@request.auth.role = 'Admin' ||\n" +
            "(@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id) ||\n" +
            "@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId";
        activities.createRule =
            "@request.auth.role = 'Admin' || (@request.auth.role = 'Teacher' && @request.body.groupId.teacherId = @request.auth.id)";
        activities.updateRule =
            "@request.auth.role = 'Admin' ||\n" +
            "(@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id)";
        activities.deleteRule =
            "@request.auth.role = 'Admin' ||\n" +
            "(@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id)";
        app.save(activities);

        // ── 4. units: Admin bypass ─────────────────────────────────────────────
        const units = app.findCollectionByNameOrId("units");
        units.listRule = "@request.auth.role = 'Admin' || @request.auth.id != ''";
        units.viewRule = "@request.auth.role = 'Admin' || @request.auth.id != ''";
        units.createRule =
            "@request.auth.role = 'Admin' || @request.auth.role = 'Teacher'";
        units.updateRule =
            "@request.auth.role = 'Admin' || @request.auth.role = 'Teacher'";
        units.deleteRule =
            "@request.auth.role = 'Admin' || @request.auth.role = 'Teacher'";
        app.save(units);

        // ── 5. submissions: Admin bypass ───────────────────────────────────────
        const submissions = app.findCollectionByNameOrId("submissions");
        submissions.listRule =
            "@request.auth.role = 'Admin' || @request.auth.id != ''";
        submissions.viewRule =
            "@request.auth.role = 'Admin' || @request.auth.id != ''";
        app.save(submissions);

        // ── 6. users: Admin can list/manage all users ─────────────────────────
        users.listRule = "@request.auth.role = 'Admin' || @request.auth.id != ''";
        users.viewRule = "@request.auth.role = 'Admin' || @request.auth.id != ''";
        users.createRule = ""; // anyone can self-register
        users.updateRule =
            "@request.auth.role = 'Admin' || @request.auth.id = id";
        users.deleteRule = "@request.auth.role = 'Admin'";
        app.save(users);
    },
    (app) => {
        // ── Rollback ──────────────────────────────────────────────────────────
        const users = app.findCollectionByNameOrId("_pb_users_auth_");
        const roleField = users.fields.getById("select_role");
        if (roleField) {
            roleField.values = ["Student", "Teacher"];
            app.save(users);
        }

        const groups = app.findCollectionByNameOrId("groups");
        groups.listRule =
            "@request.auth.role = 'Teacher' && teacherId = @request.auth.id ||\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId";
        groups.viewRule =
            "@request.auth.role = 'Teacher' && teacherId = @request.auth.id ||\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId";
        groups.updateRule =
            "@request.auth.role = 'Teacher' && teacherId = @request.auth.id";
        groups.deleteRule =
            "@request.auth.role = 'Teacher' && teacherId = @request.auth.id";
        app.save(groups);

        const activities = app.findCollectionByNameOrId("activities");
        activities.listRule =
            "@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id ||\n@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId";
        activities.viewRule =
            "@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id ||\n@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId";
        activities.updateRule =
            "@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id";
        activities.deleteRule =
            "@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id";
        app.save(activities);
    }
);
