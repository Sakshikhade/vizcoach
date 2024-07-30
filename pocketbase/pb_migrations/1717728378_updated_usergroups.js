/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ccu735acz1lznft")

  collection.listRule = "// Teachers can access all usergroups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated usergroup\n@request.auth.id = @collection.usergroups.userId"
  collection.viewRule = "// Teachers can access all usergroups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated usergroup\n@request.auth.id = @collection.usergroups.userId.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ccu735acz1lznft")

  collection.listRule = "// Teachers can access all usergroups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated usergroup\nid = @collection.usergroups.userId.id"
  collection.viewRule = "// Teachers can access all usergroups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated usergroup\nid = @collection.usergroups.userId.id"

  return dao.saveCollection(collection)
})
