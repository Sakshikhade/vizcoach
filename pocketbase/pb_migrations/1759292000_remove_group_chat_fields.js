/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123456");

  // Remove groupId field from chat_rooms collection
  const groupIdField = collection.fields.find(field => field.name === "groupId");
  if (groupIdField) {
    collection.fields.removeById(groupIdField.id);
  }

  // Remove the index that references groupId
  const indexes = collection.indexes || [];
  collection.indexes = indexes.filter(index => !index.includes('groupId'));

  // Update the collection to only support private chats
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123456");

  // Add back the groupId field (for rollback)
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "relation_group_id",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "groupId",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation",
    "collectionId": "pbc_3346940990",
    "cascadeDelete": false,
    "displayFields": ["title"]
  }));

  // Add back the groupId index
  const indexes = collection.indexes || [];
  indexes.push("CREATE INDEX idx_chat_rooms_group_id ON chat_rooms (groupId)");
  collection.indexes = indexes;

  return app.save(collection);
})
