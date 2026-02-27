/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123457")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json_readby123",
    "maxSize": 0,
    "name": "readBy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123457")

  // remove field
  collection.fields.removeById("json_readby123")

  return app.save(collection)
})
