/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wg9fbatsbxw865r")

  collection.listRule = "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if in associated group\n@request.auth.id = @collection.activities.groupId.usergroups_via_groupId.userId"
  collection.viewRule = "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if in associated group\n@request.auth.id = @collection.activities.groupId.usergroups_via_groupId.userId"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wg9fbatsbxw865r")

  collection.listRule = "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if in associated group\nid = @collection.activities.groupId.usergroups_via_groupId.userId"
  collection.viewRule = "// Teacher can access all the activities\n@request.auth.role = 'Teacher' ||\n// Students should have only access if in associated group\nid = @collection.activities.groupId.usergroups_via_groupId.userId"

  return dao.saveCollection(collection)
})
