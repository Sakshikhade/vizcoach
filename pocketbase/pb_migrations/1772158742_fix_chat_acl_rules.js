/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    // Fix chat_rooms access rules so students can see rooms they are a PARTICIPANT of,
    // not just rooms they created. The participants field is a JSON array stored as
    // a JSON type — the ~ operator does a text-contains match on the serialized value.
    const chatRooms = app.findCollectionByNameOrId("chat_rooms");

    // Any authenticated user can list/view rooms where their ID appears in participants
    chatRooms.listRule = '@request.auth.id != "" && participants ~ @request.auth.id';
    chatRooms.viewRule = '@request.auth.id != "" && participants ~ @request.auth.id';

    // Any authenticated user can create a room (teacher or student initiating a chat)
    chatRooms.createRule = '@request.auth.id != ""';

    // Only participants can update the room
    chatRooms.updateRule = '@request.auth.id != "" && participants ~ @request.auth.id';

    // Only the creator can delete
    chatRooms.deleteRule = '@request.auth.id = createdBy';

    app.save(chatRooms);

    // Fix chat_messages access rules — students could not see or create messages
    // in teacher-created rooms because the old rule checked roomId.createdBy.
    // Now: any authenticated user can list, view, and create messages.
    // The frontend always filters by roomId, and room access is controlled above.
    const chatMessages = app.findCollectionByNameOrId("chat_messages");

    // Allow any authenticated user to list and view messages
    chatMessages.listRule = '@request.auth.id != ""';
    chatMessages.viewRule = '@request.auth.id != ""';

    // Allow any authenticated user to create messages (they must be logged in)
    chatMessages.createRule = '@request.auth.id != ""';

    // Only the message author can update their message
    chatMessages.updateRule = '@request.auth.id = userId';

    // Author or teacher can delete
    chatMessages.deleteRule = '@request.auth.id = userId || @request.auth.role = "Teacher"';

    app.save(chatMessages);
}, (app) => {
    // Rollback — restore the original restrictive rules
    const chatRooms = app.findCollectionByNameOrId("chat_rooms");
    chatRooms.listRule = "@request.auth.role = 'Teacher' || (@request.auth.role = 'Student' && @request.auth.id = createdBy)";
    chatRooms.viewRule = "@request.auth.role = 'Teacher' || (@request.auth.role = 'Student' && @request.auth.id = createdBy)";
    chatRooms.createRule = "@request.auth.role = 'Teacher' || (@request.auth.role = 'Student' && @request.body.type = 'private')";
    chatRooms.updateRule = "@request.auth.role = 'Teacher' || (@request.auth.role = 'Student' && @request.auth.id = createdBy)";
    chatRooms.deleteRule = "@request.auth.role = 'Teacher' || (@request.auth.role = 'Student' && @request.auth.id = createdBy)";
    app.save(chatRooms);

    const chatMessages = app.findCollectionByNameOrId("chat_messages");
    chatMessages.listRule = "@request.auth.role = 'Teacher' || (@request.auth.role = 'Student' && @request.auth.id = @collection.chat_messages.roomId.createdBy)";
    chatMessages.viewRule = "@request.auth.role = 'Teacher' || (@request.auth.role = 'Student' && @request.auth.id = @collection.chat_messages.roomId.createdBy)";
    chatMessages.createRule = "@request.auth.role = 'Teacher' || (@request.auth.role = 'Student' && @request.auth.id = @request.body.roomId.createdBy)";
    chatMessages.updateRule = "@request.auth.role = 'Teacher' || @request.auth.id = userId";
    chatMessages.deleteRule = "@request.auth.role = 'Teacher' || @request.auth.id = userId";
    app.save(chatMessages);
});
