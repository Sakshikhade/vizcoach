/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ccu735acz1lznft",
    "created": "2024-06-07 01:34:11.481Z",
    "updated": "2024-06-07 01:34:11.481Z",
    "name": "usergroups",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "wjkwasmu",
        "name": "userId",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "uyahc8je",
        "name": "groupId",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "vuw9hvl6bikujrg",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_cJ0CYhO` ON `usergroups` (\n  `userId`,\n  `groupId`\n)"
    ],
    "listRule": "@request.auth.role = 'Teacher'",
    "viewRule": "@request.auth.role = 'Teacher'",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ccu735acz1lznft");

  return dao.deleteCollection(collection);
})
