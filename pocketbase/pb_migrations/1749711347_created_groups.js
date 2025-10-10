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
        "id": "select4147678957",
        "maxSelect": 1,
        "name": "semester",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "Fall",
          "Spring",
          "Summer"
        ]
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
        "values": [
          "CSE578"
        ]
      },
      {
        "hidden": false,
        "id": "file144986711",
        "maxSelect": 1,
        "maxSize": 0,
        "mimeTypes": [
          "text/csv"
        ],
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
    "id": "pbc_3346940990",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_S2EJonpTsv` ON `groups` (\n  `semester`,\n  `year`,\n  `course`\n)"
    ],
    "listRule": null,
    "name": "groups",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3346940990");

  return app.delete(collection);
})
