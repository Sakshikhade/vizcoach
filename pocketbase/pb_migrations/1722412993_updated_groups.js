/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vuw9hvl6bikujrg")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rdpsl9cj",
    "name": "csv",
    "type": "file",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "text/csv"
      ],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": true
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vuw9hvl6bikujrg")

  // remove
  collection.schema.removeField("rdpsl9cj")

  return dao.saveCollection(collection)
})
