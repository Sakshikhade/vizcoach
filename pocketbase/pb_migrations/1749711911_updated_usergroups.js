/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1713839652")

  // update collection data
  unmarshal({
    "listRule": "// Teachers can access all usergroups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated usergroup\n@request.auth.id ?= @collection.usergroups.userId",
    "viewRule": "// Teachers can access all usergroups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated usergroup\n@request.auth.id ?= @collection.usergroups.userId"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1713839652")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
