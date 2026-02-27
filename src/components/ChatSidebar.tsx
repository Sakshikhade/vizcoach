import { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { OnlineAvatar } from './OnlineAvatar';
import { ChatBubbleOutline, PersonAdd } from '@mui/icons-material';
import { ChatRoom, User } from 'db';
import client from 'db/client';
import { useDashboard } from 'hooks';

type ChatSidebarProps = {
  selectedRoomId?: string;
  onRoomSelect: (room: ChatRoom) => void;
  /** Optional set of online user IDs – passed from a parent that owns usePresence */
  onlineIds?: Set<string>;
};

/** Deterministic color from a string – gives each user a unique avatar color */
const stringToColor = (str: string) => {
  const palette = [
    '#1565c0',
    '#6a1b9a',
    '#00695c',
    '#e65100',
    '#283593',
    '#ad1457',
    '#2e7d32',
    '#004d40',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

export const ChatSidebar = ({
  selectedRoomId,
  onRoomSelect,
  onlineIds = new Set(),
}: ChatSidebarProps) => {
  const { user } = useDashboard();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUserSection, setActiveUserSection] = useState<
    'teachers' | 'students'
  >('teachers');
  const [showNewChat, setShowNewChat] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [roomTimestamps, setRoomTimestamps] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const initializeChat = async () => {
      await loadAllUsers();
      await loadChatRooms();
      if (user?.role === 'Teacher') loadUsers();
      else if (user?.role === 'Student') loadTeachers();
    };
    initializeChat();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchOverview = async () => {
      const { unread, latest } = await client.getRoomOverview(
        rooms.map((r) => r.id),
      );
      setUnreadCounts(unread);
      setRoomTimestamps((prev) => ({ ...prev, ...latest }));
    };
    if (rooms.length > 0) fetchOverview();
    const interval = setInterval(fetchOverview, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [user, rooms]);

  useEffect(() => {
    if (user?.role === 'Student') {
      if (activeUserSection === 'teachers') loadTeachers();
      else if (activeUserSection === 'students') loadStudents();
    }
  }, [activeUserSection, user]);

  const loadChatRooms = async () => {
    try {
      const chatRooms = await client.getChatRooms();

      // Deduplicate: keep only the most-recently-updated room per other participant.
      // getChatRooms() returns rooms sorted by -updated, so the first hit per
      // participant wins (= most recent conversation).
      const seen = new Map<string, ChatRoom>();
      for (const room of chatRooms) {
        const otherId = room.participants.find((id) => id !== user?.id);
        if (!otherId) continue; // skip malformed rooms
        if (!seen.has(otherId)) seen.set(otherId, room);
      }
      setRooms(Array.from(seen.values()));
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await client.getAllUsers();
      setUsers(usersData.filter((u) => u.id !== user?.id));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const usersData = await client.getAllUsers();
      setAllUsers(usersData);
    } catch (error) {
      console.error('Failed to load all users:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const usersData = await client.getAllUsers();
      const teachers = usersData.filter(
        (u) => u.id !== user?.id && u.role === 'Teacher',
      );
      setUsers(
        teachers.length > 0
          ? teachers
          : usersData.filter((u) => u.id !== user?.id),
      );
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const usersData = await client.getAllUsers();
      setUsers(
        usersData.filter((u) => u.id !== user?.id && u.role === 'Student'),
      );
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const createPrivateChat = async (targetUser: User) => {
    try {
      const existingRoomLocal = rooms.find(
        (room) =>
          room.type === 'private' &&
          room.participants.includes(targetUser.id) &&
          room.participants.includes(user!.id),
      );
      if (existingRoomLocal) {
        onRoomSelect(existingRoomLocal);
        setShowNewChat(false);
        return;
      }
      const allRooms = await client.getChatRooms();
      const existingRoom = allRooms.find(
        (room) =>
          room.type === 'private' &&
          room.participants.includes(targetUser.id) &&
          room.participants.includes(user!.id),
      );
      if (existingRoom) {
        setRooms((prev) =>
          prev.find((r) => r.id === existingRoom.id)
            ? prev
            : [existingRoom, ...prev],
        );
        onRoomSelect(existingRoom);
        setShowNewChat(false);
        return;
      }
      const room = await client.createChatRoom({
        name: `Private Chat`,
        type: 'private',
        description: `Private chat between ${user!.name} and ${targetUser.name}`,
        participants: [user!.id, targetUser.id],
      });
      if (room) {
        setRooms((prev) => [room, ...prev]);
        onRoomSelect(room);
        setShowNewChat(false);
      }
    } catch (error) {
      console.error('Failed to create private chat:', error);
    }
  };

  const getRoomName = (room: ChatRoom) => {
    const otherParticipantId = room.participants.find((id) => id !== user?.id);
    if (otherParticipantId) {
      const otherUser = allUsers.find((u) => u.id === otherParticipantId);
      if (otherUser) return otherUser.name;
      if (room.name.includes('Student') && user?.role === 'Student')
        return 'Teacher';
      if (room.name.includes('Teacher') && user?.role === 'Teacher')
        return 'Student';
    }
    return room.name;
  };

  const getRoomInitial = (room: ChatRoom) =>
    getRoomName(room).charAt(0).toUpperCase();
  const getRoomColor = (room: ChatRoom) => stringToColor(getRoomName(room));

  if (loading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f8faff',
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8faff',
      }}
    >
      {/* Section label */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              color: 'text.secondary',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            Conversations
          </Typography>
          <Tooltip title="New Chat" placement="right">
            <Box
              onClick={() => setShowNewChat((p) => !p)}
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: showNewChat ? 'primary.main' : 'transparent',
                border: '1.5px solid',
                borderColor: showNewChat ? 'primary.main' : 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': {
                  bgcolor: 'primary.light',
                  borderColor: 'primary.light',
                },
              }}
            >
              <PersonAdd
                sx={{
                  fontSize: 14,
                  color: showNewChat ? 'white' : 'primary.main',
                  transition: 'color 0.18s',
                }}
              />
            </Box>
          </Tooltip>
        </Stack>
      </Box>

      {/* Room list */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {rooms.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              px: 2,
              gap: 1,
            }}
          >
            <ChatBubbleOutline sx={{ fontSize: 32, color: 'grey.400' }} />
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              No conversations yet.
              <br />
              Start one below!
            </Typography>
          </Box>
        ) : (
          [...rooms]
            .sort((a, b) => {
              const tA = roomTimestamps[a.id] || a.created.toISOString();
              const tB = roomTimestamps[b.id] || b.created.toISOString();
              return tB > tA ? 1 : tB < tA ? -1 : 0;
            })
            .map((room) => {
              const isSelected = selectedRoomId === room.id;
              const name = getRoomName(room);
              const color = getRoomColor(room);
              return (
                <Box
                  key={room.id}
                  onClick={() => onRoomSelect(room)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.2,
                    mx: 1,
                    mb: 0.5,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    bgcolor: isSelected
                      ? 'rgba(25,118,210,0.10)'
                      : 'transparent',
                    border: '1.5px solid',
                    borderColor: isSelected
                      ? 'rgba(25,118,210,0.25)'
                      : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isSelected
                        ? 'rgba(25,118,210,0.12)'
                        : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <OnlineAvatar
                    name={getRoomName(room)}
                    color={getRoomColor(room)}
                    size={36}
                    online={onlineIds.has(
                      room.participants.find((id) => id !== user?.id) ?? '',
                    )}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? 700 : 500}
                      noWrap
                      sx={{
                        color: isSelected ? 'primary.dark' : 'text.primary',
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      Private Chat
                    </Typography>
                  </Box>
                  {unreadCounts[room.id] > 0 && (
                    <Badge
                      badgeContent={unreadCounts[room.id]}
                      max={5}
                      color="error"
                      sx={{
                        mr: 1,
                        '& .MuiBadge-badge': {
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  )}
                </Box>
              );
            })
        )}
      </Box>

      {/* New chat panel */}
      {showNewChat && (
        <>
          <Divider sx={{ mx: 1 }} />
          <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: 'text.secondary',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                display: 'block',
                mb: 1,
              }}
            >
              New Chat
            </Typography>

            {/* Students: tab toggle */}
            {user?.role === 'Student' && (
              <Stack direction="row" spacing={0.5} mb={1}>
                {(['teachers', 'students'] as const).map((section) => (
                  <Button
                    key={section}
                    size="small"
                    onClick={() => setActiveUserSection(section)}
                    sx={{
                      flex: 1,
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: '8px',
                      py: 0.4,
                      textTransform: 'capitalize',
                      bgcolor:
                        activeUserSection === section
                          ? 'primary.main'
                          : 'transparent',
                      color:
                        activeUserSection === section
                          ? 'white'
                          : 'text.secondary',
                      border: '1.5px solid',
                      borderColor:
                        activeUserSection === section
                          ? 'primary.main'
                          : 'divider',
                      '&:hover': {
                        bgcolor:
                          activeUserSection === section
                            ? 'primary.dark'
                            : 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </Button>
                ))}
              </Stack>
            )}

            <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
              {users.length === 0 ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ pl: 0.5 }}
                >
                  {user?.role === 'Student' && activeUserSection === 'teachers'
                    ? 'No teachers available'
                    : 'No users available'}
                </Typography>
              ) : (
                users.map((targetUser) => (
                  <Box
                    key={targetUser.id}
                    onClick={() => createPrivateChat(targetUser)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1,
                      py: 0.8,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: 'rgba(25,118,210,0.07)' },
                    }}
                  >
                    <OnlineAvatar
                      name={targetUser.name}
                      size={28}
                      online={onlineIds.has(targetUser.id)}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {targetUser.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {targetUser.role}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};
