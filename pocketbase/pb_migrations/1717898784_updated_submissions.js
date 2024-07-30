/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("caz4so4q4ot33ym")

  // remove
  collection.schema.removeField("tjxih5yd")

  // remove
  collection.schema.removeField("mukcuhxj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fvdlaobu",
    "name": "state",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "help",
        "submitted"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
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

  // remove
  collection.schema.removeField("fvdlaobu")

  return dao.saveCollection(collection)
})
