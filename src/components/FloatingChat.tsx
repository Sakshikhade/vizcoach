import { useState, useEffect } from 'react';
import {
    Avatar,
    Badge,
    Box,
    Fade,
    Grid,
    IconButton,
    Paper,
    Tooltip,
    Typography,
} from '@mui/material';
import { Chat, Close } from '@mui/icons-material';
import { ChatRoom } from 'db';
import { ChatSidebar, ChatWindow } from 'components';
import client from 'db/client';

export const FloatingChat = () => {
    const [open, setOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | undefined>();

    useEffect(() => {
        if (selectedRoomId) {
            loadSelectedRoom();
        }
    }, [selectedRoomId]);

    const loadSelectedRoom = async () => {
        if (!selectedRoomId) return;
        try {
            const room = await client.getChatRoom(selectedRoomId);
            setSelectedRoom(room || undefined);
        } catch (error) {
            console.error('Failed to load chat room:', error);
        }
    };

    const handleRoomSelect = (roomId: string) => {
        setSelectedRoomId(roomId);
    };

    const toggleChat = () => {
        setOpen((prev) => !prev);
    };

    return (
        <>
            {/* Floating Chat Panel */}
            <Fade in={open} unmountOnExit>
                <Paper
                    elevation={8}
                    sx={{
                        position: 'fixed',
                        bottom: '5.5rem',
                        right: '1.5rem',
                        width: { xs: 'calc(100vw - 2rem)', sm: 700 },
                        height: 520,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        zIndex: 1300,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                    }}
                >
                    {/* Panel Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            py: 1.5,
                            background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                            color: 'white',
                            flexShrink: 0,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                }}
                            >
                                <Chat sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Chat
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={toggleChat}
                            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Panel Body */}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Grid container sx={{ height: '100%' }}>
                            {/* Sidebar */}
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    borderRight: 1,
                                    borderColor: 'divider',
                                    height: '100%',
                                    overflow: 'hidden',
                                }}
                            >
                                <Box sx={{ height: '100%', overflow: 'auto' }}>
                                    <ChatSidebar
                                        selectedRoomId={selectedRoomId}
                                        onRoomSelect={handleRoomSelect}
                                    />
                                </Box>
                            </Grid>

                            {/* Chat Window */}
                            <Grid item xs={8} sx={{ height: '100%', overflow: 'hidden' }}>
                                {selectedRoom ? (
                                    <ChatWindow room={selectedRoom} />
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'grey.50',
                                            gap: 1,
                                        }}
                                    >
                                        <Chat sx={{ fontSize: 40, color: 'grey.400' }} />
                                        <Typography variant="body2" color="text.secondary" textAlign="center" px={2}>
                                            Select a conversation to start chatting
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Fade>

            {/* Floating Action Button */}
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
                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 1301,
                        boxShadow: open
                            ? '0 4px 20px rgba(25, 118, 210, 0.55)'
                            : '0 4px 14px rgba(25, 118, 210, 0.4)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            transform: 'scale(1.08)',
                            boxShadow: '0 6px 24px rgba(25, 118, 210, 0.6)',
                        },
                        '&:active': {
                            transform: 'scale(0.96)',
                        },
                    }}
                >
                    {open ? (
                        <Close sx={{ color: 'white', fontSize: 26 }} />
                    ) : (
                        <Chat sx={{ color: 'white', fontSize: 26 }} />
                    )}
                </Box>
            </Tooltip>
        </>
    );
};
