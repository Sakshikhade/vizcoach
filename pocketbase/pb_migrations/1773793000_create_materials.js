/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = new Collection({
        "id": "pbc_materials000",
        "name": "materials",
        "type": "base",
        "system": false,
        "fields": [
            {
                "id": "text3208210256",
                "name": "id",
                "type": "text",
                "system": true,
                "primaryKey": true,
                "required": true,
                "presentable": false,
                "unique": false,
                "min": 15,
                "max": 15,
                "pattern": "^[a-z0-9]+$"
            },
            {
                "id": "relation_groupId",
                "name": "groupId",
                "type": "relation",
                "required": true,
                "presentable": false,
                "collectionId": "pbc_3346940990",
                "cascadeDelete": true,
                "minSelect": 0,
                "maxSelect": 1,
                "displayFields": null
            },
            {
                "id": "text_title",
                "name": "title",
                "type": "text",
                "required": true,
                "presentable": false,
                "min": 0,
                "max": 0,
                "pattern": ""
            },
            {
                "id": "select_type",
                "name": "type",
                "type": "select",
                "required": true,
                "presentable": false,
                "maxSelect": 1,
                "values": [
                    "Syllabus",
                    "Presentation",
                    "Document",
                    "Video",
                    "Other"
                ]
            },
            {
                "id": "file_file",
                "name": "file",
                "type": "file",
                "required": false,
                "presentable": false,
                "mimeTypes": [],
                "thumbs": [],
                "maxSelect": 5,
                "maxSize": 52428800,
                "protected": false
            },
            {
                "id": "autodate_created",
                "name": "created",
                "type": "autodate",
                "required": false,
                "presentable": false,
                "onCreate": true,
                "onUpdate": false
            },
            {
                "id": "autodate_updated",
                "name": "updated",
                "type": "autodate",
                "required": false,
                "presentable": false,
                "onCreate": true,
                "onUpdate": true
            }
        ],
        "listRule": "@request.auth.role = 'Admin' || (@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id) || @request.auth.id ?= @collection.materials.groupId.usergroups_via_groupId.userId",
        "viewRule": "@request.auth.role = 'Admin' || (@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id) || @request.auth.id ?= @collection.materials.groupId.usergroups_via_groupId.userId",
        "createRule": "@request.auth.role = 'Admin' || (@request.auth.role = 'Teacher' && @request.body.groupId.teacherId = @request.auth.id)",
        "updateRule": "@request.auth.role = 'Admin' || (@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id)",
        "deleteRule": "@request.auth.role = 'Admin' || (@request.auth.role = 'Teacher' && groupId.teacherId = @request.auth.id)"
    });

    return app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("materials");
    if (collection) {
        return app.delete(collection);
    }
})
