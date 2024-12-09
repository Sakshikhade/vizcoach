/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6l4936bab050a0b")

  collection.listRule = "// Teacher can access all the submissions' comments\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions' comments\n@request.auth.id = @collection.comments.submissionId.userId"
  collection.viewRule = "// Teacher can access all the submissions' comments\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions' comments\n@request.auth.id = @collection.comments.submissionId.userId"
  collection.createRule = "// Teacher can access all the submissions' comments\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions' comments\n@request.auth.id = @collection.comments.submissionId.userId"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6l4936bab050a0b")

  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = ""

  return dao.saveCollection(collection)
})
