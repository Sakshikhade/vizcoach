import { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { ChatMessage, ChatRoom } from 'db';
import client from 'db/client';
import { useDashboard } from 'hooks';
import { RichEditor } from './RichEditor';

type ChatWindowProps = {
  room: ChatRoom;
};

export const ChatWindow = ({ room }: ChatWindowProps) => {
  const { user } = useDashboard();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllUsers();
    loadMessages();
    setupMessageSubscription();

    return () => {
      client.unregisterChatMessageCallback();
    };
  }, [room.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const chatMessages = await client.getChatMessages(room.id);
      setMessages(chatMessages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupMessageSubscription = () => {
    client.registerChatMessageCallback(room.id, (message) => {
      // Double-check that the message belongs to this room
      if (message.roomId === room.id) {
        setMessages((prev) => [...prev, message]);
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAllUsers = async () => {
    try {
      const usersData = await client.getAllUsers();
      setAllUsers(usersData);
    } catch (error) {
      console.error('Failed to load all users:', error);
    }
  };

  const getUserName = (userId: string) => {
    const foundUser = allUsers.find((u) => u.id === userId);
    return foundUser?.name || 'Unknown User';
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const message = await client.postChatMessage({
        roomId: room.id,
        content: newMessage,
        type: 'text',
      });

      if (message) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.userId === user?.id;
  };

  if (loading) {
    return (
      <Paper
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Loading messages...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">{room.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {room.description}
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {messages.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No messages yet. Start the conversation!
          </Alert>
        ) : (
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  flexDirection: isOwnMessage(message) ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                }}
              >
                <ListItemAvatar
                  sx={{
                    alignSelf: 'flex-start',
                    mr: isOwnMessage(message) ? 0 : 1,
                    ml: isOwnMessage(message) ? 1 : 0,
                  }}
                >
                  <Avatar>
                    {getUserName(message.userId)?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    textAlign: isOwnMessage(message) ? 'right' : 'left',
                  }}
                  primary={
                    <Box
                      sx={{
                        bgcolor: isOwnMessage(message)
                          ? 'primary.main'
                          : 'grey.100',
                        color: isOwnMessage(message) ? 'white' : 'text.primary',
                        p: 1.5,
                        borderRadius: 2,
                        maxWidth: '70%',
                        ml: isOwnMessage(message) ? 'auto' : 0,
                        mr: isOwnMessage(message) ? 0 : 'auto',
                      }}
                    >
                      <Typography
                        variant="body1"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                        sx={{
                          '& p': { margin: 0 },
                          '& *': { color: 'inherit' },
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        justifyContent: isOwnMessage(message)
                          ? 'flex-end'
                          : 'flex-start',
                        mt: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {getUserName(message.userId)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatMessageTime(message.created)}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <Box sx={{ flex: 1 }}>
            <RichEditor value={newMessage} onChange={setNewMessage} />
          </Box>
          <IconButton
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            color="primary"
            sx={{ alignSelf: 'flex-end' }}
          >
            <Send />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};
