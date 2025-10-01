migrate((app) => {
  const collection = new Collection({
    "id": "pbc_groupchats002",
    "name": "group_chats_simple",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "field_name",
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
        "id": "field_group_id",
        "name": "groupId",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_groupchats002");
  return app.save(collection);
})
