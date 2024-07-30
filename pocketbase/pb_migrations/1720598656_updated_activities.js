/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wg9fbatsbxw865r")

  collection.createRule = "@request.auth.role = 'Teacher'"
  collection.updateRule = "@request.auth.role = 'Teacher'"
  collection.deleteRule = "@request.auth.role = 'Teacher'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wg9fbatsbxw865r")

  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return dao.saveCollection(collection)
})
