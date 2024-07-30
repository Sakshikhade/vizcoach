/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6u6unqr0hh1fafs")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "thdivfvi",
    "name": "order",
    "type": "number",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 1,
      "max": 5,
      "noDecimal": true
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6u6unqr0hh1fafs")

  // remove
  collection.schema.removeField("thdivfvi")

  return dao.saveCollection(collection)
})
