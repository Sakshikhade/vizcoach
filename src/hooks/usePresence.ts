/**
 * usePresence – Online indicator hook
 *
 * Currently returns an empty Set (presence feature disabled).
 *
 * To enable green "online" dots in chat:
 *   1. Open PocketBase Admin → Collections → users
 *   2. Add a field: name = "lastSeen", type = DateTime, optional = true
 *   3. Set PocketbaseClient.PRESENCE_ENABLED = true in db/client.ts
 *
 * Once enabled this hook will:
 *   - Send a heartbeat every 30 s for the logged-in user
 *   - Subscribe to real-time user record changes
 *   - Return a live Set<string> of online user IDs
 */
export const usePresence = (): Set<string> => {
  return new Set<string>();
};
