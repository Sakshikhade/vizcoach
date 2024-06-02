import { ReactNode, useState } from 'react';
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

interface NavigationButton {
  title: string;
  icon: ReactNode;
}

const pages: NavigationButton[] = [
  {
    title: 'Activities',
    icon: <BarChart />,
  },
  {
    title: 'Student Groups',
    icon: <Group />,
  },
];

const settings: NavigationButton[] = [
  {
    title: 'Profile',
    icon: <AccountBox />,
  },
  {
    title: 'logout',
    icon: <Logout />,
  },
];

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
      {pages.map((page) => (
        <Button
          key={page.title}
          size="small"
          variant="text"
          startIcon={page.icon}
          sx={{ color: 'white' }}
        >
          {page.title}
        </Button>
      ))}
    </>
  );
};

const NavigationProfile = () => {
  const [profileMenuEl, setProfileMenuEl] = useState<HTMLElement | null>(null);

  const closeProfileMenu = () => setProfileMenuEl(null);
  const openProfileMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setProfileMenuEl(event.currentTarget);
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
        {settings.map((setting) => (
          <MenuItem
            key={setting.title}
            onClick={closeProfileMenu}
            sx={{ display: 'flex', columnGap: '.5rem' }}
          >
            {setting.icon}
            <Typography textAlign="center">{setting.title}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
