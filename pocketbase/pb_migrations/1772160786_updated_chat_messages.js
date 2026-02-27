/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123457")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123457")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id = userId"
  }, collection)

  return app.save(collection)
})
