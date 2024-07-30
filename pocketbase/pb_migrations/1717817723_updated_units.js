/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6u6unqr0hh1fafs")

  collection.listRule = ""

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "73ngldqr",
    "name": "activityId",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "wg9fbatsbxw865r",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6u6unqr0hh1fafs")

  collection.listRule = null

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "73ngldqr",
    "name": "activity",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "wg9fbatsbxw865r",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
