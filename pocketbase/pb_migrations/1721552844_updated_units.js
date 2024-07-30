/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6u6unqr0hh1fafs")

  collection.createRule = "@request.auth.role = 'Teacher'"
  collection.updateRule = "@request.auth.role = 'Teacher'"
  collection.deleteRule = "@request.auth.role = 'Teacher'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6u6unqr0hh1fafs")

  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return dao.saveCollection(collection)
})
