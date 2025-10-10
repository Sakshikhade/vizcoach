/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1262591861")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'Teacher'",
    "deleteRule": "@request.auth.role = 'Teacher'",
    "listRule": "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if in associated group\n@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId",
    "updateRule": "@request.auth.role = 'Teacher'",
    "viewRule": "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if in associated group\n@request.auth.id ?= @collection.activities.groupId.usergroups_via_groupId.userId"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1262591861")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
