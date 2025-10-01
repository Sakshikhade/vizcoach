/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123456");

  // Simplified rules - allow all authenticated users to see all chat rooms
  // This is more permissive but ensures the chat works
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  collection.createRule = "@request.auth.id != ''";
  collection.updateRule = "@request.auth.id = createdBy";
  collection.deleteRule = "@request.auth.id = createdBy";

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123456");

  // Revert to previous rules
  collection.listRule = "// Teachers can see all chat rooms\n@request.auth.role = 'Teacher' ||\n// Students can see chats they're participants in\n(@request.auth.role = 'Student' && @request.auth.id in participants)";
  collection.viewRule = "// Teachers can view all chat rooms\n@request.auth.role = 'Teacher' ||\n// Students can view chats they're participants in\n(@request.auth.role = 'Student' && @request.auth.id in participants)";
  collection.createRule = "// Teachers can create any chat room\n@request.auth.role = 'Teacher' ||\n// Students can create private chats\n(@request.auth.role = 'Student' && @request.body.type = 'private')";
  collection.updateRule = "// Teachers can update any chat room\n@request.auth.role = 'Teacher' ||\n// Students can update chats they created\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)";
  collection.deleteRule = "// Teachers can delete any chat room\n@request.auth.role = 'Teacher' ||\n// Students can delete chats they created\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)";

  return app.save(collection);
})
