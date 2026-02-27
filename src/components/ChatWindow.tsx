import { useState, useEffect, useRef } from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { OnlineAvatar } from './OnlineAvatar';
import { Send, Done, DoneAll } from '@mui/icons-material';
import { ChatMessage, ChatRoom } from 'db';
import client from 'db/client';
import { useDashboard } from 'hooks';
import { RichEditor } from './RichEditor';

type ChatWindowProps = {
  room: ChatRoom;
  /** Optional set of online user IDs – passed from a parent that owns usePresence */
  onlineIds?: Set<string>;
};

/** Deterministic avatar color */
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

export const ChatWindow = ({
  room,
  onlineIds = new Set(),
}: ChatWindowProps) => {
  const { user } = useDashboard();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
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
    if (!user) return;
    try {
      setLoading(true);
      const chatMessages = await client.getChatMessages(room.id);
      setMessages(chatMessages.reverse());

      // Mark unread messages sent by others as read
      const unreadIds = chatMessages
        .filter((m) => m.userId !== user.id && !m.readBy.includes(user.id))
        .map((m) => m.id);
      if (unreadIds.length > 0) {
        await client.markMessagesAsRead(unreadIds);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupMessageSubscription = () => {
    if (!user) return;
    client.registerChatMessageCallback(room.id, (action, message) => {
      if (message.roomId === room.id) {
        setMessages((prev) => {
          if (action === 'delete')
            return prev.filter((m) => m.id !== message.id);
          if (action === 'update')
            return prev.map((m) => (m.id === message.id ? message : m));
          if (action === 'create') {
            // Drop duplicate
            if (prev.some((m) => m.id === message.id)) return prev;
            // Mark as read immediately if from someone else
            if (
              message.userId !== user.id &&
              !message.readBy.includes(user.id)
            ) {
              client.markMessagesAsRead([message.id]);
            }
            return [...prev, message];
          }
          return prev;
        });
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
    return foundUser?.name || 'Unknown';
  };

  /** Strip HTML tags to get the actual text content for empty-check */
  const getTextContent = (html: string) => html.replace(/<[^>]*>/g, '').trim();

  const sendMessage = async () => {
    const textContent = getTextContent(newMessage);
    if (!textContent || sending) return;
    setSendError(null);
    try {
      setSending(true);
      await client.postChatMessage({
        roomId: room.id,
        content: newMessage,
        type: 'text',
      });
      // Always clear after create — the realtime subscription delivers the
      // message back into state, so we don’t need the return value here.
      setNewMessage('');
    } catch (error: any) {
      const msg =
        error?.message ||
        error?.data?.message ||
        'Failed to send — please try again.';
      setSendError(msg);
      console.error('sendMessage error:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);

  const isOwn = (message: ChatMessage) => message.userId === user?.id;

  /* ── Derive header name from room participants ── */
  const otherParticipantId = room.participants?.find((id) => id !== user?.id);
  const otherName = otherParticipantId
    ? allUsers.find((u) => u.id === otherParticipantId)?.name || 'Chat'
    : room.name;

  if (loading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg,#f0f4ff 0%,#fff 100%)',
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.2,
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          bgcolor: '#fff',
          flexShrink: 0,
        }}
      >
        <OnlineAvatar
          name={otherName}
          size={36}
          online={!!otherParticipantId && onlineIds.has(otherParticipantId)}
        />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ lineHeight: 1.2 }}
            >
              {otherName}
            </Typography>
            {otherParticipantId && onlineIds.has(otherParticipantId) && (
              <Typography
                variant="caption"
                sx={{ color: '#22c55e', fontWeight: 600, fontSize: '0.7rem' }}
              >
                Online
              </Typography>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Private Chat
          </Typography>
        </Box>
      </Box>

      {/* ── Messages ───────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          background: 'linear-gradient(180deg,#f5f8ff 0%,#ffffff 100%)',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 4,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              👋 Say hello to start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map((message, idx) => {
            const own = isOwn(message);
            const senderName = getUserName(message.userId);
            const showAvatar =
              !own &&
              (idx === 0 || messages[idx - 1].userId !== message.userId);

            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: own ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 1,
                  mt: showAvatar && !own ? 1 : 0,
                }}
              >
                {/* Avatar – only for received messages, only on first in a group */}
                {!own && (
                  <Box sx={{ width: 28, flexShrink: 0, mb: 0.5 }}>
                    {showAvatar ? (
                      <OnlineAvatar
                        name={senderName}
                        size={28}
                        online={onlineIds.has(message.userId)}
                      />
                    ) : (
                      <Box sx={{ width: 28 }} />
                    )}
                  </Box>
                )}

                <Box
                  sx={{
                    maxWidth: '72%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: own ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Bubble */}
                  <Box
                    sx={{
                      px: 1.8,
                      py: 1,
                      borderRadius: own
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      background: own
                        ? 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)'
                        : '#f0f2f8',
                      color: own ? 'white' : 'text.primary',
                      boxShadow: own
                        ? '0 2px 8px rgba(25,118,210,0.25)'
                        : '0 1px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      component="div"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                      sx={{
                        '& p': { margin: 0, lineHeight: 1.5 },
                        '& *': { color: 'inherit' },
                        fontSize: '0.8375rem',
                      }}
                    />
                  </Box>

                  {/* Timestamp */}
                  {/* Timestamp & Read Status */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.3,
                      color: 'text.disabled',
                      fontSize: '0.68rem',
                      px: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {formatMessageTime(message.created)}
                    {own &&
                      (() => {
                        const allRead = room.participants.every((id) =>
                          message.readBy.includes(id),
                        );
                        const someRead = message.readBy.length > 1;

                        if (allRead) {
                          return (
                            <DoneAll
                              sx={{ fontSize: '0.8rem', color: '#3b82f6' }}
                            />
                          );
                        } else if (someRead) {
                          return (
                            <DoneAll
                              sx={{
                                fontSize: '0.8rem',
                                color: 'text.disabled',
                              }}
                            />
                          );
                        } else {
                          return (
                            <Done
                              sx={{
                                fontSize: '0.8rem',
                                color: 'text.disabled',
                              }}
                            />
                          );
                        }
                      })()}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* ── Input ──────────────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          pt: 1,
          pb: 1.5,
          borderTop: '1px solid rgba(0,0,0,0.07)',
          bgcolor: '#fff',
        }}
      >
        {/* Error banner */}
        {sendError && (
          <Box
            sx={{
              mb: 1,
              px: 1.5,
              py: 0.8,
              borderRadius: '8px',
              bgcolor: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#dc2626' }}>
              ⚠️ {sendError}
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={1} alignItems="flex-end">
          <Box
            sx={{
              flex: 1,
              borderRadius: '12px',
              border: '1.5px solid',
              borderColor: sendError ? 'error.light' : 'divider',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
              '&:focus-within': {
                borderColor: sendError ? 'error.main' : 'primary.main',
              },
            }}
          >
            <RichEditor
              value={newMessage}
              onChange={(v) => {
                setNewMessage(v);
                if (sendError) setSendError(null);
              }}
            />
          </Box>
          <Tooltip title="Send">
            <span>
              <IconButton
                onClick={sendMessage}
                disabled={!getTextContent(newMessage) || sending}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor:
                    !getTextContent(newMessage) || sending
                      ? 'grey.200'
                      : 'primary.main',
                  color:
                    !getTextContent(newMessage) || sending
                      ? 'grey.400'
                      : 'white',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor:
                      !getTextContent(newMessage) || sending
                        ? 'grey.200'
                        : 'primary.dark',
                    transform:
                      !getTextContent(newMessage) || sending
                        ? 'none'
                        : 'scale(1.05)',
                  },
                  '&.Mui-disabled': { bgcolor: 'grey.200', color: 'grey.400' },
                }}
              >
                {sending ? (
                  <CircularProgress size={16} sx={{ color: 'grey.500' }} />
                ) : (
                  <Send sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};
