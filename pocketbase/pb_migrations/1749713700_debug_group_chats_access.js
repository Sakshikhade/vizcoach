migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_groupchats001");
  
  // Make access rules very permissive for debugging
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "";
  collection.updateRule = "";
  collection.deleteRule = "";
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_groupchats001");
  
  // Revert to previous rules
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  collection.createRule = "@request.auth.role = 'Teacher'";
  collection.updateRule = "@request.auth.role = 'Teacher'";
  collection.deleteRule = "@request.auth.role = 'Teacher'";
  
  return app.save(collection);
})
