/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3482339971")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id ?= @request.body.unitId.activityId.groupId.usergroups_via_groupId.userId",
    "listRule": "// Teacher can access all the submissions\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions\n@request.auth.id ?= @collection.submissions.userId",
    "updateRule": "@request.auth.id ?= @request.body.unitId.activityId.groupId.usergroups_via_groupId.userId",
    "viewRule": "// Teacher can access all the submissions\n@request.auth.role = 'Teacher' ||\n// Students should have only access their submissions\n@request.auth.id ?= @collection.submissions.userId"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3482339971")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
