/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vuw9hvl6bikujrg")

  collection.listRule = "// Teachers can access all groups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated group\nid = @collection.groups.usergroups_via_groupId.userId"
  collection.viewRule = "// Teachers can access all groups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated group\nid = @collection.groups.usergroups_via_groupId.userId"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vuw9hvl6bikujrg")

  collection.listRule = "@request.auth.role = 'Teacher'"
  collection.viewRule = "@request.auth.role = 'Teacher'"

  return dao.saveCollection(collection)
})
