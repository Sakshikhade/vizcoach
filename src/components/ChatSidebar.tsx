import { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Add, Chat, Group, Person, Message } from '@mui/icons-material';
import { ChatRoom, Group as GroupType, User } from 'db';
import client from 'db/client';
import { useDashboard } from 'hooks';
import StudentSelectionModal from './StudentSelectionModal';

type ChatSidebarProps = {
  selectedRoomId?: string;
  onRoomSelect: (roomId: string) => void;
};

export const ChatSidebar = ({
  selectedRoomId,
  onRoomSelect,
}: ChatSidebarProps) => {
  const { user } = useDashboard();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUserSection, setActiveUserSection] = useState<
    'teachers' | 'students'
  >('teachers');
  const [userGroups, setUserGroups] = useState<GroupType[]>([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      // Load all users first, then chat rooms
      await loadAllUsers();
      await loadChatRooms();

      if (user?.role === 'Teacher') {
        loadGroups();
        loadUsers();
      } else if (user?.role === 'Student') {
        loadTeachers();
        loadUserGroups();
      }
    };

    initializeChat();
  }, [user]);

  // Load users when active section changes
  useEffect(() => {
    if (user?.role === 'Student') {
      if (activeUserSection === 'teachers') {
        loadTeachers();
      } else if (activeUserSection === 'students') {
        loadStudents();
      }
    }
  }, [activeUserSection, user]);

  const loadChatRooms = async () => {
    try {
      const chatRooms = await client.getChatRooms();
      setRooms(chatRooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await client.getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await client.getAllUsers();
      // Filter out the current user
      const otherUsers = usersData.filter((u) => u.id !== user?.id);
      setUsers(otherUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const usersData = await client.getAllUsers();
      console.log(
        'Loaded all users for room naming:',
        usersData.map((u) => ({ id: u.id, name: u.name, role: u.role })),
      );
      setAllUsers(usersData);
    } catch (error) {
      console.error('Failed to load all users:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const usersData = await client.getAllUsers();
      console.log('=== TEACHER LOADING DEBUG ===');
      console.log(
        'All users for teacher filtering:',
        usersData.map((u) => ({
          id: u.id,
          name: u.name,
          role: u.role,
          email: u.email,
        })),
      );
      console.log('Current user:', {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      });

      // Filter to show only teachers (excluding current user)
      const teachers = usersData.filter(
        (u) => u.id !== user?.id && u.role === 'Teacher',
      );
      console.log(
        'Filtered teachers:',
        teachers.map((t) => ({ id: t.id, name: t.name, role: t.role })),
      );

      // If no teachers found, let's see what roles we have
      if (teachers.length === 0) {
        console.log(
          'No teachers found. All user roles:',
          usersData.map((u) => ({
            id: u.id,
            name: u.name,
            role: u.role,
            roleType: typeof u.role,
          })),
        );

        // Try different role variations
        const teachersVariations = usersData.filter(
          (u) =>
            u.id !== user?.id &&
            (u.role === 'Teacher' ||
              (u.role as any) === 'teacher' ||
              (u.role as any) === 'TEACHER' ||
              u.role === undefined ||
              u.role === null ||
              (u.role as any) === ''),
        );
        console.log(
          'Teachers with variations:',
          teachersVariations.map((t) => ({
            id: t.id,
            name: t.name,
            role: t.role,
          })),
        );

        // Show all other users as fallback
        const allOtherUsers = usersData.filter((u) => u.id !== user?.id);
        console.log(
          'Showing all other users as fallback:',
          allOtherUsers.map((u) => ({ id: u.id, name: u.name, role: u.role })),
        );
        setUsers(allOtherUsers);
      } else {
        setUsers(teachers);
      }
      console.log('=== END TEACHER LOADING DEBUG ===');
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const usersData = await client.getAllUsers();
      console.log('=== STUDENT LOADING DEBUG ===');
      console.log(
        'All users for student filtering:',
        usersData.map((u) => ({
          id: u.id,
          name: u.name,
          role: u.role,
          email: u.email,
        })),
      );
      console.log('Current user:', {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      });

      // Filter to show only students (excluding current user)
      const students = usersData.filter(
        (u) => u.id !== user?.id && u.role === 'Student',
      );
      console.log(
        'Filtered students:',
        students.map((s) => ({ id: s.id, name: s.name, role: s.role })),
      );

      setUsers(students);
      console.log('=== END STUDENT LOADING DEBUG ===');
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const loadUserGroups = async () => {
    try {
      const groupsData = await client.getUserGroups();
      console.log(
        'User groups:',
        groupsData.map((g) => ({ id: g.id, title: g.title })),
      );
      setUserGroups(groupsData);
    } catch (error) {
      console.error('Failed to load user groups:', error);
    }
  };

  const handleCreateGroupChat = (group: GroupType) => {
    // Check if a group chat already exists for this group
    const existingRoom = rooms.find(
      (room) => room.type === 'group' && room.groupId === group.id,
    );

    if (existingRoom) {
      console.log('Found existing group chat:', existingRoom.id);
      onRoomSelect(existingRoom.id);
      return;
    }

    // Show student selection modal
    setSelectedGroup(group);
    setShowStudentModal(true);
  };

  const handleStudentSelection = async (selectedStudentIds: string[]) => {
    if (!selectedGroup || !user) return;

    try {
      console.log('Creating group chat for:', selectedGroup.title);
      console.log('Selected students:', selectedStudentIds);

      // Create participants list: teacher + selected students
      const participants = [user.id, ...selectedStudentIds];
      console.log('Group chat participants:', participants);

      const groupChat = await client.createGroupChat(
        selectedGroup.id,
        `${selectedGroup.title} Chat`,
        `Group chat for ${selectedGroup.title}`,
        participants,
      );

      if (groupChat) {
        console.log('Created group chat:', groupChat.id);
        // Convert GroupChat to ChatRoom for compatibility with existing UI
        const room = new ChatRoom({
          id: groupChat.id,
          name: groupChat.name,
          type: 'group',
          description: groupChat.description,
          groupId: groupChat.groupId,
          participants: groupChat.participants,
          createdBy: groupChat.createdBy,
          isActive: groupChat.isActive,
          created: groupChat.created.toISOString(),
          updated: groupChat.updated.toISOString(),
          collectionId: 'pbc_7890123456',
          collectionName: 'chat_rooms',
          expand: {
            groupId: groupChat.group,
            createdBy: groupChat.creator,
          },
        });
        setRooms((prev) => [room, ...prev]);
        onRoomSelect(room.id);
      } else {
        console.error('Failed to create group chat - no room returned');
        alert('Failed to create group chat. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to create group chat:', error);

      // Show user-friendly error message
      if (
        error.message?.includes('No groups found') ||
        error.message?.includes('Group with ID') ||
        error.message?.includes('Group validation failed')
      ) {
        alert(
          'Cannot create group chat: No groups found. Please create groups first by going to the Groups page.',
        );
      } else {
        alert(
          `Failed to create group chat: ${error.message || 'Unknown error'}`,
        );
      }
    }
  };

  const createPrivateChat = async (targetUser: User) => {
    try {
      console.log('Creating private chat with:', targetUser.name);

      // First check local state for existing room
      const existingRoomLocal = rooms.find(
        (room) =>
          room.type === 'private' &&
          room.participants.includes(targetUser.id) &&
          room.participants.includes(user!.id),
      );

      if (existingRoomLocal) {
        console.log(
          'Found existing room in local state:',
          existingRoomLocal.id,
        );
        onRoomSelect(existingRoomLocal.id);
        return;
      }

      // If not found locally, check all chat rooms from database
      const allRooms = await client.getChatRooms();
      const existingRoom = allRooms.find(
        (room) =>
          room.type === 'private' &&
          room.participants.includes(targetUser.id) &&
          room.participants.includes(user!.id),
      );

      if (existingRoom) {
        console.log('Found existing room in database:', existingRoom.id);
        // Add to local state if not already there
        setRooms((prev) => {
          const exists = prev.find((r) => r.id === existingRoom.id);
          return exists ? prev : [existingRoom, ...prev];
        });
        onRoomSelect(existingRoom.id);
        return;
      }

      console.log('No existing room found, creating new one');
      const room = await client.createChatRoom({
        name: `Private Chat`, // Generic name, will be overridden by getRoomName
        type: 'private',
        description: `Private chat between ${user!.name} and ${targetUser.name}`,
        participants: [user!.id, targetUser.id],
      });

      if (room) {
        console.log('Created new room:', room.id);
        setRooms((prev) => [room, ...prev]);
        onRoomSelect(room.id);
      }
    } catch (error) {
      console.error('Failed to create private chat:', error);
    }
  };

  const getRoomIcon = (room: ChatRoom) => {
    if (room.type === 'group') {
      return <Group />;
    }
    return <Person />;
  };

  const getRoomName = (room: ChatRoom) => {
    if (room.type === 'group') {
      return room.name;
    }
    // For private chats, show the other participant's name
    const otherParticipantId = room.participants.find((id) => id !== user?.id);
    if (otherParticipantId) {
      // Find the other participant in all users
      const otherUser = allUsers.find((u) => u.id === otherParticipantId);
      if (otherUser) {
        return `Chat with ${otherUser.name}`;
      } else {
        // Debug: log when we can't find the other user
        console.log('Could not find other user for room:', {
          roomId: room.id,
          roomName: room.name,
          otherParticipantId,
          currentUserId: user?.id,
          currentUserName: user?.name,
          currentUserRole: user?.role,
          allUsers: allUsers.map((u) => ({
            id: u.id,
            name: u.name,
            role: u.role,
          })),
          roomParticipants: room.participants,
        });

        // If we can't find the user in allUsers, try to determine role from room name
        // This is a fallback for existing rooms with old naming
        if (room.name.includes('Student') && user?.role === 'Student') {
          return 'Chat with Teacher';
        } else if (room.name.includes('Teacher') && user?.role === 'Teacher') {
          return 'Chat with Student';
        }
      }
    }
    return room.name; // Fallback to original name
  };

  const getRoomSubtitle = (room: ChatRoom) => {
    if (room.type === 'group') {
      return room.group?.title || 'Group Chat';
    }
    return 'Private Chat';
  };

  if (loading) {
    return (
      <Paper sx={{ height: '100%', p: 2 }}>
        <Typography>Loading chat rooms...</Typography>
      </Paper>
    );
  }

  if (user?.role === 'Teacher' && groups.length === 0) {
    return (
      <Paper sx={{ height: '100%', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chat Rooms
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No groups available. Create groups first to start group chats.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => (window.location.href = '/dashboard/groups')}
        >
          Create Group
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chat />
          <Typography variant="h6">Chat</Typography>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {rooms.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No chat rooms available"
                secondary="Create a group chat or wait for someone to start a conversation"
                sx={{ textAlign: 'center', py: 2 }}
              />
            </ListItem>
          ) : (
            rooms.map((room) => (
              <ListItem key={room.id} disablePadding>
                <ListItemButton
                  selected={selectedRoomId === room.id}
                  onClick={() => onRoomSelect(room.id)}
                >
                  <ListItemAvatar>
                    <Avatar>{getRoomIcon(room)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getRoomName(room)}
                    secondary={getRoomSubtitle(room)}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>

      {user?.role === 'Teacher' && (
        <>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Create Group Chat
            </Typography>
            <Stack spacing={1}>
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleCreateGroupChat(group)}
                  disabled={rooms.some((room) => room.groupId === group.id)}
                >
                  {group.title}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Start Private Chat
            </Typography>
            <Stack spacing={1} sx={{ maxHeight: 200, overflow: 'auto' }}>
              {users.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No other users available
                </Typography>
              ) : (
                users.map((targetUser) => (
                  <Button
                    key={targetUser.id}
                    variant="outlined"
                    size="small"
                    startIcon={<Message />}
                    onClick={() => createPrivateChat(targetUser)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ width: '100%' }}
                    >
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {targetUser.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ textAlign: 'left', flex: 1 }}>
                        <Typography variant="body2" noWrap>
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
                    </Stack>
                  </Button>
                ))
              )}
            </Stack>
          </Box>
        </>
      )}

      {user?.role === 'Student' && (
        <>
          {/* My Groups Section for Students */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              My Groups
            </Typography>
            <Stack spacing={1}>
              {userGroups.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  You are not assigned to any groups
                </Typography>
              ) : (
                userGroups.map((group) => (
                  <Box
                    key={group.id}
                    sx={{
                      p: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {group.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.course} • {group.semester} {group.year}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
          </Box>

          {/* Group Chats Section for Students */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Group Chats
            </Typography>
            <Stack spacing={1}>
              {rooms.filter((room) => room.type === 'group').length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No group chats available
                </Typography>
              ) : (
                rooms
                  .filter((room) => room.type === 'group')
                  .map((room) => (
                    <Button
                      key={room.id}
                      variant="outlined"
                      size="small"
                      startIcon={<Group />}
                      onClick={() => onRoomSelect(room.id)}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      <Box sx={{ textAlign: 'left', flex: 1 }}>
                        <Typography variant="body2" noWrap>
                          {room.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {room.description}
                        </Typography>
                      </Box>
                    </Button>
                  ))
              )}
            </Stack>
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Start Private Chat
            </Typography>

            {/* Toggle buttons for Teachers/Students */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                variant={
                  activeUserSection === 'teachers' ? 'contained' : 'outlined'
                }
                size="small"
                onClick={() => setActiveUserSection('teachers')}
                sx={{ flex: 1 }}
              >
                Teachers
              </Button>
              <Button
                variant={
                  activeUserSection === 'students' ? 'contained' : 'outlined'
                }
                size="small"
                onClick={() => setActiveUserSection('students')}
                sx={{ flex: 1 }}
              >
                Students
              </Button>
            </Stack>

            <Stack spacing={1} sx={{ maxHeight: 200, overflow: 'auto' }}>
              {users.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {activeUserSection === 'teachers'
                    ? 'No teachers available'
                    : 'No students available'}
                </Typography>
              ) : (
                users.map((targetUser) => (
                  <Button
                    key={targetUser.id}
                    variant="outlined"
                    size="small"
                    startIcon={<Message />}
                    onClick={() => createPrivateChat(targetUser)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ width: '100%' }}
                    >
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {targetUser.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ textAlign: 'left', flex: 1 }}>
                        <Typography variant="body2" noWrap>
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
                    </Stack>
                  </Button>
                ))
              )}
            </Stack>
          </Box>
        </>
      )}

      {/* Student Selection Modal */}
      {selectedGroup && (
        <StudentSelectionModal
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedGroup(null);
          }}
          group={selectedGroup}
          onConfirm={handleStudentSelection}
          client={client}
        />
      )}
    </Paper>
  );
};
