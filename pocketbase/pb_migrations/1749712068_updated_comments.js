/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // update collection data
  unmarshal({
    "createRule": "// Teacher can access all the submissions' comments\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions' comments\n@request.auth.id ?= @request.body.submissionId.userId",
    "listRule": "// Teacher can access all the submissions' comments\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions' comments\n@request.auth.id ?= @collection.comments.submissionId.userId",
    "viewRule": "// Teacher can access all the submissions' comments\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions' comments\n@request.auth.id ?= @collection.comments.submissionId.userId"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
