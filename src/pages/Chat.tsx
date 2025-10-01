import { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { ChatRoom } from 'db';
import { ChatSidebar, ChatWindow } from 'components';
import { Dashboard } from 'components';
import client from 'db/client';

export const Chat = () => {
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

  return (
    <>
      <Dashboard.Breadcrumbs title="Chat">
        <Dashboard.Breadcrumbs.Link href="/dashboard">
          Dashboard
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading="Chat"
        subtitle="Communicate with your group members and teachers"
      />

      <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
        <Grid item xs={12} md={4}>
          <ChatSidebar
            selectedRoomId={selectedRoomId}
            onRoomSelect={handleRoomSelect}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          {selectedRoom ? (
            <ChatWindow room={selectedRoom} />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50',
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Select a chat room to start messaging
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};
