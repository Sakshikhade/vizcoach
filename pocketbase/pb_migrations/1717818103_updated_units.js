/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6u6unqr0hh1fafs")

  collection.listRule = "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if associated with activity\n@request.auth.id = @collection.units.activityId.groupId.usergroups_via_groupId.userId"
  collection.viewRule = "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if associated with activity\n@request.auth.id = @collection.units.activityId.groupId.usergroups_via_groupId.userId"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6u6unqr0hh1fafs")

  collection.listRule = ""
  collection.viewRule = null

  return dao.saveCollection(collection)
})
