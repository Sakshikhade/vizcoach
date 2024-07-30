/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("caz4so4q4ot33ym")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tjxih5yd",
    "name": "completed",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("caz4so4q4ot33ym")

  // remove
  collection.schema.removeField("tjxih5yd")

  return dao.saveCollection(collection)
})
