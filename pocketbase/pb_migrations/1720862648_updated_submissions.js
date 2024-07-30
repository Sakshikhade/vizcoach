/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("caz4so4q4ot33ym")

  collection.updateRule = "@request.auth.id = @request.data.unitId.activityId.groupId.usergroups_via_groupId.userId"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("caz4so4q4ot33ym")

  collection.updateRule = null

  return dao.saveCollection(collection)
})
