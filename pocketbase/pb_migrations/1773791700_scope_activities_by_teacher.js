/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("activities")

    // Scope teacher access: only activities whose group belongs to them
    unmarshal({
        "listRule": "@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id ||\n@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId",
        "viewRule": "@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id ||\n@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId",
        "createRule": "@request.auth.role = 'Teacher' && @request.body.groupId.teacherId = @request.auth.id",
        "updateRule": "@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id",
        "deleteRule": "@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id"
    }, collection)

    return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("activities")

    // Revert to original rules
    unmarshal({
        "listRule": "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if in associated group\n@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId",
        "viewRule": "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if in associated group\n@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId",
        "createRule": "@request.auth.role = 'Teacher'",
        "updateRule": "@request.auth.role = 'Teacher'",
        "deleteRule": "@request.auth.role = 'Teacher'"
    }, collection)

    return app.save(collection)
})
