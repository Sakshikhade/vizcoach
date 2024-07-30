/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("caz4so4q4ot33ym")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mukcuhxj",
    "name": "help",
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
  collection.schema.removeField("mukcuhxj")

  return dao.saveCollection(collection)
})
