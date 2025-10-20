import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Button,
  Container,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  AccountBox,
  BarChart,
  Group,
  Logout,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { VizCoachLogo } from 'components';
import { useAuth, useDashboard } from 'hooks';

export const NavigationBar = () => {
  const { user } = useDashboard();
  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Stack direction="row">
            <VizCoachLogo />
            <Stack direction="row" columnGap={2} sx={{ ml: 4 }}>
              {user?.role === 'Teacher' && <NavigationPages />}
            </Stack>
          </Stack>
          <NavigationProfile />
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
        Assignments
      </Button>
      <Button
        variant="text"
        startIcon={<Group />}
        sx={{ color: 'white' }}
        onClick={() => navigate('groups')}
      >
        Classes
      </Button>
      <Button
        variant="text"
        startIcon={<DashboardIcon />}
        sx={{ color: 'white' }}
        onClick={() => navigate('orchestration')}
      >
        Orchestration View
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
