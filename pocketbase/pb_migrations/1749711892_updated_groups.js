/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3346940990")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'Teacher'",
    "deleteRule": "@request.auth.role = 'Teacher'",
    "listRule": "// Teachers can access all groups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated group\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId",
    "updateRule": "@request.auth.role = 'Teacher'",
    "viewRule": "// Teachers can access all groups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated group\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3346940990")

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
