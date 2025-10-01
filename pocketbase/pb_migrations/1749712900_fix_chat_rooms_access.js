/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123456");
  
  // Set proper access rules for chat rooms
  collection.createRule = "// Teachers can create any chat room\n@request.auth.role = 'Teacher' ||\n// Students can create private chats\n(@request.auth.role = 'Student' && @request.body.type = 'private')";
  collection.listRule = "// Teachers can see all chat rooms\n@request.auth.role = 'Teacher' ||\n// Students can see rooms they're participants in\n(@request.auth.role = 'Student' && @request.auth.id in participants)";
  collection.viewRule = "// Teachers can view all chat rooms\n@request.auth.role = 'Teacher' ||\n// Students can view rooms they're participants in\n(@request.auth.role = 'Student' && @request.auth.id in participants)";
  collection.updateRule = "// Teachers can update any chat room\n@request.auth.role = 'Teacher' ||\n// Students can update rooms they created\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)";
  collection.deleteRule = "// Teachers can delete any chat room\n@request.auth.role = 'Teacher' ||\n// Students can delete rooms they created\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)";
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7890123456");
  
  // Revert to original rules
  collection.createRule = "// Teachers can create any chat room\n@request.auth.role = 'Teacher' ||\n// Students can create private chats with teachers\n(@request.auth.role = 'Student' && @request.body.type = 'private')";
  collection.listRule = "// Teachers can see all chat rooms\n@request.auth.role = 'Teacher' ||\n// Students can see group chats they're in and private chats they're part of\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)";
  collection.viewRule = "// Teachers can view all chat rooms\n@request.auth.role = 'Teacher' ||\n// Students can view group chats they're in and private chats they're part of\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)";
  collection.updateRule = "// Teachers can update any chat room\n@request.auth.role = 'Teacher' ||\n// Students can update private chats they created\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)";
  collection.deleteRule = "// Teachers can delete any chat room\n@request.auth.role = 'Teacher' ||\n// Students can delete private chats they created\n(@request.auth.role = 'Student' && @request.auth.id = createdBy)";
  
  return app.save(collection);
})
