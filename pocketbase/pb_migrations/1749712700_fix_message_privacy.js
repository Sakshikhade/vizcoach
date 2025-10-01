/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123457");

  // Keep permissive rules but we'll filter in the frontend
  // This ensures the chat works while we implement proper filtering
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  collection.createRule = "@request.auth.id != ''";
  collection.updateRule = "@request.auth.id = userId";
  collection.deleteRule = "@request.auth.id = userId";

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123457");

  // Revert to previous rules
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  collection.createRule = "@request.auth.id != ''";
  collection.updateRule = "@request.auth.id = userId";
  collection.deleteRule = "@request.auth.id = userId";

  return app.save(collection);
})
