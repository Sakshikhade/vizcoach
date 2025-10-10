/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
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
        "id": "json1795630405",
        "maxSize": 0,
        "name": "json",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation1689669068",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "userId",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_586599074",
        "hidden": false,
        "id": "relation2996690421",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "unitId",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select2744374011",
        "maxSelect": 1,
        "name": "state",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "help",
          "submitted"
        ]
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
    "id": "pbc_3482339971",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_aQjfXedA5T` ON `submissions` (\n  `userId`,\n  `unitId`\n)"
    ],
    "listRule": null,
    "name": "submissions",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3482339971");

  return app.delete(collection);
})
