import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { AccountBox, BarChart, Group, Logout } from '@mui/icons-material';
import { VizCoachLogo } from '.';
import { useAuth } from 'hooks';

export const NavigationBar = () => {
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
              <NavigationPages />
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
  return (
    <>
      <Button
        size="small"
        variant="text"
        startIcon={<BarChart />}
        sx={{ color: 'white' }}
      >
        Activities
      </Button>
      <Button
        size="small"
        variant="text"
        startIcon={<Group />}
        sx={{ color: 'white' }}
      >
        Student Groups
      </Button>
    </>
  );
};

const NavigationProfile = () => {
  const [profileMenuEl, setProfileMenuEl] = useState<HTMLElement | null>(null);
  const { logout } = useAuth();
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
      <IconButton onClick={openProfileMenu} sx={{ p: 0 }}>
        <Avatar
          alt="Chris Bryan"
          src="https://ca.slack-edge.com/EBY1XTCCR-WFMHSL6MP-b74f7340ae4a-512"
        />
      </IconButton>
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
