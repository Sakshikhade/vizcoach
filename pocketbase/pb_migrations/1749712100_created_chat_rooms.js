/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "// Teachers can create any chat room\n@request.auth.role = 'Teacher' ||\n// Students can create private chats with teachers\n(@request.auth.role = 'Student' && @request.body.type = 'private')",
    "deleteRule": "// Teachers can delete any chat room\n@request.auth.role = 'Teacher' ||\n// Students can delete private chats they created\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
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
        "id": "text1234567890",
        "max": 100,
        "min": 1,
        "name": "name",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select1234567",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": ["group", "private"]
      },
      {
        "hidden": false,
        "id": "text2345678",
        "max": 500,
        "min": 0,
        "name": "description",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3346940990",
        "hidden": false,
        "id": "relation3456789",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "groupId",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "json4567890",
        "name": "participants",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation5678901",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "createdBy",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "bool6789012",
        "name": "isActive",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "bool"
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
    "id": "pbc_7890123456",
    "indexes": [
      "CREATE INDEX idx_chat_rooms_type ON chat_rooms (type)",
      "CREATE INDEX idx_chat_rooms_group_id ON chat_rooms (groupId)",
      "CREATE INDEX idx_chat_rooms_created_by ON chat_rooms (createdBy)"
    ],
    "listRule": "// Teachers can see all chat rooms\n@request.auth.role = 'Teacher' ||\n// Students can see group chats they're in and private chats they're part of\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)",
    "name": "chat_rooms",
    "system": false,
    "type": "base",
    "updateRule": "// Teachers can update any chat room\n@request.auth.role = 'Teacher' ||\n// Students can update private chats they created\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)",
    "viewRule": "// Teachers can view all chat rooms\n@request.auth.role = 'Teacher' ||\n// Students can view group chats they're in and private chats they're part of\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123456");

  return app.delete(collection);
})
