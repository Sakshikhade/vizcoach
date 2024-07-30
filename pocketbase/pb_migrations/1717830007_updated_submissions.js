/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("caz4so4q4ot33ym")

  collection.listRule = "// Teacher can access all the submissions\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions\n@request.auth.id = @collection.submissions.userId"
  collection.viewRule = "// Teacher can access all the submissions\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions\n@request.auth.id = @collection.submissions.userId"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("caz4so4q4ot33ym")

  collection.listRule = null
  collection.viewRule = null

  return dao.saveCollection(collection)
})
