/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "vuw9hvl6bikujrg",
    "created": "2024-06-07 01:27:59.930Z",
    "updated": "2024-06-07 01:27:59.930Z",
    "name": "groups",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ibsznawf",
        "name": "year",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 2000,
          "max": 2100,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "dk1whs7s",
        "name": "semester",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "Spring",
            "Summer",
            "Fall"
          ]
        }
      },
      {
        "system": false,
        "id": "fghdapj1",
        "name": "course",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "CSE578"
          ]
        }
      }
    ],
    "indexes": [],
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
  const collection = dao.findCollectionByNameOrId("vuw9hvl6bikujrg");

  return dao.deleteCollection(collection);
})
