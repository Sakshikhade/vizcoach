migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_groupchats001");
  
  // Update access rules to be more permissive for list and view
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  collection.createRule = "@request.auth.role = 'Teacher'";
  collection.updateRule = "@request.auth.role = 'Teacher'";
  collection.deleteRule = "@request.auth.role = 'Teacher'";
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_groupchats001");
  
  // Revert to original rules
  collection.listRule = "@request.auth.role = 'Teacher'";
  collection.viewRule = "@request.auth.role = 'Teacher'";
  collection.createRule = "@request.auth.role = 'Teacher'";
  collection.updateRule = "@request.auth.role = 'Teacher'";
  collection.deleteRule = "@request.auth.role = 'Teacher'";
  
  return app.save(collection);
})
