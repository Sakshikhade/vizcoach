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
  AdminPanelSettings,
  BarChart,
  Chat,
  Group,
  Logout,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { VizCoachLogo } from 'components';
import { useAuth, useDashboard } from 'hooks';

export const NavigationBar = () => {
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
              <NavigationPages />
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
  const { user } = useDashboard();

  return (
    <>
      <Button
        variant="text"
        startIcon={<BarChart />}
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          '&:hover': { color: 'primary.main', backgroundColor: 'transparent' },
        }}
        onClick={() => navigate('activities')}
      >
        Assignments
      </Button>
      {user?.role === 'Teacher' && (
        <>
          <Button
            variant="text"
            startIcon={<Group />}
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'transparent',
              },
            }}
            onClick={() => navigate('groups')}
          >
            Classes
          </Button>
          <Button
            variant="text"
            startIcon={<DashboardIcon />}
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'transparent',
              },
            }}
            onClick={() => navigate('orchestration')}
          >
            Orchestration View
          </Button>
        </>
      )}
      {user?.role === 'Admin' && (
        <Button
          variant="contained"
          size="small"
          startIcon={<AdminPanelSettings />}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            fontWeight: 700,
            borderRadius: 2,
            ml: 1,
          }}
          onClick={() => navigate('/admin')}
        >
          Admin Panel
        </Button>
      )}
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
        color="inherit"
        startIcon={
          <Avatar
            alt={user?.name}
            src={user?.avatar}
            sx={{ width: 32, height: 32 }}
          />
        }
        onClick={openProfileMenu}
        sx={{
          p: 0.5,
          pr: 1.5,
          borderRadius: '24px',
          backgroundColor: '#ffffff',
          color: 'text.primary',
          borderColor: 'divider',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <Typography textAlign="center" fontWeight={600} variant="body2">
          {user?.name}
        </Typography>
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
