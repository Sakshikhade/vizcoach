import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { AccountBox, BarChart, Group, Logout } from '@mui/icons-material';
import { VizCoachLogo } from '.';
import { useAuth } from 'hooks';

export const NavigationBar = () => {
  const { user } = useAuth();
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex' }}>
            <VizCoachLogo />
            <Box sx={{ display: 'flex', ml: '4rem', columnGap: '2rem' }}>
              {user?.role === 'Teacher' && <NavigationPages />}
            </Box>
          </Box>
          <Box>
            <NavigationProfile />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

const NavigationPages = () => {
  const navigate = useNavigate();
  return (
    <>
      <Button
        variant="text"
        startIcon={<BarChart />}
        sx={{ color: 'white' }}
        onClick={() => navigate('activities')}
      >
        Activities
      </Button>
      <Button
        variant="text"
        startIcon={<Group />}
        sx={{ color: 'white' }}
        onClick={() => navigate('groups')}
      >
        Student Groups
      </Button>
    </>
  );
};

const NavigationProfile = () => {
  const [profileMenuEl, setProfileMenuEl] = useState<HTMLElement | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeProfileMenu = () => setProfileMenuEl(null);
  const openProfileMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setProfileMenuEl(event.currentTarget);
  };

  const onLogoutClick = () => {
    logout();
    closeProfileMenu();
    navigate('/login');
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Avatar alt={user?.name} src={user?.avatar} />}
        onClick={openProfileMenu}
        sx={{ p: 0, color: 'white' }}
      >
        <Typography textAlign="center">{user?.name}</Typography>
      </Button>
      <Menu
        anchorEl={profileMenuEl}
        open={Boolean(profileMenuEl)}
        onClose={closeProfileMenu}
      >
        <MenuItem
          onClick={closeProfileMenu}
          sx={{ display: 'flex', columnGap: '.5rem' }}
        >
          <AccountBox />
          <Typography textAlign="center">Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={onLogoutClick}
          sx={{ display: 'flex', columnGap: '.5rem' }}
        >
          <Logout />
          <Typography textAlign="center">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
