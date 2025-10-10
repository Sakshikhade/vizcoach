/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_586599074")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "file2929936659",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "reference",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_586599074")

  // remove field
  collection.fields.removeById("file2929936659")

  return app.save(collection)
})
