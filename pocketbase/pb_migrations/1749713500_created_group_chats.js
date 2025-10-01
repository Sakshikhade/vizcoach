migrate((app) => {
  const collection = new Collection({
    "id": "pbc_groupchats001",
    "name": "group_chats",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "field_groupchat_name",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "id": "field_groupchat_description",
        "name": "description",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 500,
          "pattern": ""
        }
      },
      {
        "id": "field_groupchat_group",
        "name": "groupId",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "pbc_3346940990",
          "cascadeDelete": false,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": ["title"]
        }
      },
      {
        "id": "field_groupchat_participants",
        "name": "participants",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "id": "field_groupchat_created_by",
        "name": "createdBy",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": ["name"]
        }
      },
      {
        "id": "field_groupchat_active",
        "name": "isActive",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.role = 'Teacher'",
    "updateRule": "@request.auth.role = 'Teacher'",
    "deleteRule": "@request.auth.role = 'Teacher'"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_groupchats001");
  return app.save(collection);
})