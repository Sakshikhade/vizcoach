migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3346940990");
  
  // Make access rules very permissive for debugging
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "";
  collection.updateRule = "";
  collection.deleteRule = "";
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3346940990");
  
  // Revert to original rules
  collection.listRule = "// Teachers can access all groups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated group\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId";
  collection.viewRule = "// Teachers can access all groups\n@request.auth.role = 'Teacher' ||\n// Students can only access their associated group\n@request.auth.id ?= @collection.groups.usergroups_via_groupId.userId";
  collection.createRule = "@request.auth.role = 'Teacher'";
  collection.updateRule = "@request.auth.role = 'Teacher'";
  collection.deleteRule = "@request.auth.role = 'Teacher'";
  
  return app.save(collection);
})
