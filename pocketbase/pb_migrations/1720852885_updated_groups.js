/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vuw9hvl6bikujrg")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_iXD5qUq` ON `groups` (\n  `year`,\n  `semester`,\n  `course`\n)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vuw9hvl6bikujrg")

  collection.indexes = [
    "CREATE INDEX `idx_iXD5qUq` ON `groups` (\n  `year`,\n  `semester`,\n  `course`\n)"
  ]

  return dao.saveCollection(collection)
})
