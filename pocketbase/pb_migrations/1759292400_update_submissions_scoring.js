/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3482339971");

  // Allow teachers to update submissions
  unmarshal({
    "updateRule": "@request.auth.role = 'Teacher' || @request.auth.id ?= @request.body.unitId.activityId.groupId.usergroups_via_groupId.userId"
  }, collection);

  // Add score field if not present
  const hasScore = collection.fields.some((f) => f.name === "score");
  if (!hasScore) {
    collection.fields.addAt(collection.fields.length, new Field({
      "id": "number_score",
      "name": "score",
      "type": "number",
      "system": false,
      "required": false,
      "presentable": false,
      "options": { "min": 0 }
    }));
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3482339971");

  // Restore original rule (students only) for update
  unmarshal({
    "updateRule": "@request.auth.id ?= @request.body.unitId.activityId.groupId.usergroups_via_groupId.userId"
  }, collection);

  // Remove score field if present
  const scoreField = collection.fields.find((f) => f.name === "score");
  if (scoreField) {
    collection.fields.removeById(scoreField.id);
  }

  return app.save(collection);
})


