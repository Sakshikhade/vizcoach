/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("pbc_3346940990") // groups

    // Add teacherId relation field (relates to users collection)
    unmarshal({
        "fields": [
            {
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "select4147678957",
                "maxSelect": 1,
                "name": "semester",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "select",
                "values": ["Fall", "Spring", "Summer"]
            },
            {
                "hidden": false,
                "id": "number3145888567",
                "max": 2100,
                "min": 2000,
                "name": "year",
                "onlyInt": true,
                "presentable": false,
                "required": true,
                "system": false,
                "type": "number"
            },
            {
                "hidden": false,
                "id": "select379482041",
                "maxSelect": 1,
                "name": "course",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "select",
                "values": ["CSE578"]
            },
            {
                "hidden": false,
                "id": "file144986711",
                "maxSelect": 1,
                "maxSize": 0,
                "mimeTypes": ["text/csv"],
                "name": "csv",
                "presentable": false,
                "protected": true,
                "required": true,
                "system": false,
                "thumbs": [],
                "type": "file"
            },
            {
                "cascadeDelete": false,
                "collectionId": "_pb_users_auth_",
                "hidden": false,
                "id": "relation_teacher_id",
                "maxSelect": 1,
                "minSelect": 0,
                "name": "teacherId",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "relation"
            },
            {
                "hidden": false,
                "id": "autodate2990389176",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate3332085495",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        // Update rules: teachers only see/modify their own groups
        "listRule": "@request.auth.role = 'Teacher' && teacherId = @request.auth.id ||\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId",
        "viewRule": "@request.auth.role = 'Teacher' && teacherId = @request.auth.id ||\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId",
        "createRule": "@request.auth.role = 'Teacher'",
        "updateRule": "@request.auth.role = 'Teacher' && teacherId = @request.auth.id",
        "deleteRule": "@request.auth.role = 'Teacher' && teacherId = @request.auth.id",
        // Drop unique index on (semester, year, course) — two teachers can have the same class
        "indexes": []
    }, collection)

    return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3346940990")

    // Revert: remove teacherId field, restore old rules and unique index
    unmarshal({
        "fields": [
            {
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "select4147678957",
                "maxSelect": 1,
                "name": "semester",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "select",
                "values": ["Fall", "Spring", "Summer"]
            },
            {
                "hidden": false,
                "id": "number3145888567",
                "max": 2100,
                "min": 2000,
                "name": "year",
                "onlyInt": true,
                "presentable": false,
                "required": true,
                "system": false,
                "type": "number"
            },
            {
                "hidden": false,
                "id": "select379482041",
                "maxSelect": 1,
                "name": "course",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "select",
                "values": ["CSE578"]
            },
            {
                "hidden": false,
                "id": "file144986711",
                "maxSelect": 1,
                "maxSize": 0,
                "mimeTypes": ["text/csv"],
                "name": "csv",
                "presentable": false,
                "protected": true,
                "required": true,
                "system": false,
                "thumbs": [],
                "type": "file"
            },
            {
                "hidden": false,
                "id": "autodate2990389176",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate3332085495",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "listRule": "// Teachers can access all groups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated group\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId",
        "viewRule": "// Teachers can access all groups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated group\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId",
        "createRule": "@request.auth.role = 'Teacher'",
        "updateRule": "@request.auth.role = 'Teacher'",
        "deleteRule": "@request.auth.role = 'Teacher'",
        "indexes": [
            "CREATE UNIQUE INDEX `idx_S2EJonpTsv` ON `groups` (\n  `semester`,\n  `year`,\n  `course`\n)"
        ]
    }, collection)

    return app.save(collection)
})
