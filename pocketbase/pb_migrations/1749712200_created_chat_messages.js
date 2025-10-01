/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "// Teachers can post messages in any chat room\n@request.auth.role = 'Teacher' ||\n// Students can post messages in rooms they created\n(@request.auth.role = 'Student' && @request.auth.id = @request.body.roomId.createdBy)",
    "deleteRule": "// Teachers can delete any message\n@request.auth.role = 'Teacher' ||\n// Students can delete their own messages\n@request.auth.id = userId",
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
        "cascadeDelete": true,
        "collectionId": "pbc_7890123456",
        "hidden": false,
        "id": "relation1234567890",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "roomId",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation2345678901",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "userId",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "convertURLs": false,
        "hidden": false,
        "id": "editor3456789012",
        "maxSize": 0,
        "name": "content",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "editor"
      },
      {
        "hidden": false,
        "id": "select4567890123",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": ["text", "system"]
      },
      {
        "hidden": false,
        "id": "text5678901234",
        "max": 15,
        "min": 0,
        "name": "replyTo",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
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
    "id": "pbc_7890123457",
    "indexes": [
      "CREATE INDEX idx_chat_messages_room_id ON chat_messages (roomId)",
      "CREATE INDEX idx_chat_messages_user_id ON chat_messages (userId)",
      "CREATE INDEX idx_chat_messages_created ON chat_messages (created)"
    ],
    "listRule": "// Teachers can see all messages\n@request.auth.role = 'Teacher' ||\n// Students can see messages in rooms they created\n(@request.auth.role = 'Student' && @request.auth.id = @collection.chat_messages.roomId.createdBy)",
    "name": "chat_messages",
    "system": false,
    "type": "base",
    "updateRule": "// Teachers can update any message\n@request.auth.role = 'Teacher' ||\n// Students can update their own messages\n@request.auth.id = userId",
    "viewRule": "// Teachers can view all messages\n@request.auth.role = 'Teacher' ||\n// Students can view messages in rooms they created\n(@request.auth.role = 'Student' && @request.auth.id = @collection.chat_messages.roomId.createdBy)"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123457");

  return app.delete(collection);
})
