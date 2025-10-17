/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Since we already removed the groupId field, any existing group chat rooms
  // will now have type='group' but no groupId field, which is fine.
  // The application code will no longer create or access group chats.
  // We don't need to delete existing data as it will be ignored by the application.
  
  return;
}, (app) => {
  // This migration cannot be rolled back as we're deleting data
  return;
})
