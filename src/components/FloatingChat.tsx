import { useState } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Slide,
  Tooltip,
  Typography,
} from '@mui/material';
import { Chat, Close } from '@mui/icons-material';
import { ChatRoom } from 'db';
import { ChatSidebar, ChatWindow } from 'components';
import { usePresence } from 'hooks';

export const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | undefined>();
  // Single presence subscription owned here – passed as a prop to children
  const onlineIds = usePresence();

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const toggleChat = () => setOpen((prev) => !prev);

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────── */}
      <Slide direction="up" in={open} unmountOnExit mountOnEnter>
        <Box
          sx={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1.5rem',
            width: { xs: 'calc(100vw - 2rem)', sm: 760 },
            height: 560,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            zIndex: 1300,
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(25,118,210,0.18)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 1.5,
              background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Chat sx={{ fontSize: 18, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ color: 'white', lineHeight: 1.2 }}
                >
                  Messages
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}
                >
                  VizCoach Chat
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={toggleChat}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.22)',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Sidebar – dark left column */}
            <Box
              sx={{
                width: 240,
                flexShrink: 0,
                borderRight: '1px solid rgba(0,0,0,0.08)',
                height: '100%',
                overflow: 'auto',
                bgcolor: '#f8faff',
              }}
            >
              <ChatSidebar
                selectedRoomId={selectedRoom?.id}
                onRoomSelect={handleRoomSelect}
                onlineIds={onlineIds}
              />
            </Box>

            {/* Main chat area */}
            <Box sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
              {selectedRoom ? (
                <ChatWindow room={selectedRoom} onlineIds={onlineIds} />
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    background:
                      'linear-gradient(160deg,#f0f4ff 0%,#ffffff 100%)',
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg,#bbdefb 0%,#e3f2fd 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(25,118,210,0.15)',
                    }}
                  >
                    <Chat sx={{ fontSize: 34, color: '#1976d2' }} />
                  </Box>
                  <Box textAlign="center" px={3}>
                    <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
                      No conversation selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pick a chat from the list or start a new one
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Slide>

      {/* ── Floating Action Button ─────────────────────── */}
      <Tooltip title={open ? 'Close Chat' : 'Open Chat'} placement="left">
        <Box
          onClick={toggleChat}
          id="floating-chat-fab"
          aria-label="Toggle Chat"
          sx={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1301,
            boxShadow: open
              ? '0 0 0 6px rgba(25,118,210,0.18), 0 6px 20px rgba(25,118,210,0.5)'
              : '0 4px 16px rgba(25,118,210,0.45)',
            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow:
                '0 0 0 8px rgba(25,118,210,0.14), 0 8px 28px rgba(25,118,210,0.55)',
            },
            '&:active': { transform: 'scale(0.94)' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.25s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            {open ? (
              <Close sx={{ color: 'white', fontSize: 24 }} />
            ) : (
              <Chat sx={{ color: 'white', fontSize: 24 }} />
            )}
          </Box>
        </Box>
      </Tooltip>
    </>
  );
};
