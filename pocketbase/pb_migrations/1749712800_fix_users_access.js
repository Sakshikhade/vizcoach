/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_");
  
  // Update access rules to allow authenticated users to read other users
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_");
  
  // Revert to original rules (restrictive)
  collection.listRule = "@request.auth.id = id";
  collection.viewRule = "@request.auth.id = id";
  
  return app.save(collection);
})
