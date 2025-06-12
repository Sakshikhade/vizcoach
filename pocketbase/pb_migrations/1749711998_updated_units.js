/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_586599074")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'Teacher'",
    "deleteRule": "@request.auth.role = 'Teacher'",
    "listRule": "// Teacher can access all the units\n@request.auth.role = 'Teacher' ||\n// Students should have only access if associated with activity\n@request.auth.id ?= @collection.units.activityId.groupId.usergroups_via_groupId.userId",
    "updateRule": "@request.auth.role = 'Teacher'",
    "viewRule": "// Teacher can access all the units\n@request.auth.role = 'Teacher' ||\n// Students should have only access if associated with activity\n@request.auth.id ?= @collection.units.activityId.groupId.usergroups_via_groupId.userId"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_586599074")

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
