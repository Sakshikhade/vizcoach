import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, IconButton, ListItemIcon, Menu, MenuItem, Paper, Stack, Typography } from '@mui/material';
import { DeleteRounded, EditNoteRounded, MoreVert } from '@mui/icons-material';
import { Dashboard, DatasetTabs } from 'components';
import client, { GetUnitResponse } from 'db';
import { useDashboard } from 'hooks';

export const ViewUnit = () => {
  const { useData } = useDashboard();
  const { activity, unit, datasets } = useData!<GetUnitResponse>();
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const onUnitDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this unit? This action will delete students' submissions too.",
      )
    ) {
      try {
        await client.deleteUnit(unit);
        navigate(`/dashboard/activities/${activity.id}/units`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const closeMenu = () => setMenuAnchorEl(null);

  return (
    <>
      <Dashboard.Breadcrumbs title={unit.title}>
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Activities
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link
          href={`/dashboard/activities/${activity.id}/units`}
        >
          {activity.title}
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading={unit.title}
        subtitle="View this unit's description and datasets."
      >
        <IconButton aria-label="unit actions" onClick={openMenu}>
          <MoreVert sx={{ color: 'black' }} />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={closeMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { closeMenu(); navigate(`../${unit.id}/edit-unit`); }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'grey.200', width: 28, height: 28 }}>
                <EditNoteRounded fontSize="small" sx={{ color: 'black' }} />
              </Avatar>
            </ListItemIcon>
            Edit Unit
          </MenuItem>
          <MenuItem onClick={() => { closeMenu(); onUnitDelete(); }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'grey.200', width: 28, height: 28 }}>
                <DeleteRounded fontSize="small" sx={{ color: 'black' }} />
              </Avatar>
            </ListItemIcon>
            Delete Unit
          </MenuItem>
        </Menu>
      </Dashboard.Header>

      <Stack padding={0.5}>
        <Paper variant="outlined">
          <Typography
            dangerouslySetInnerHTML={{ __html: unit.description }}
            sx={{
              minHeight: '20rem',
              maxHeight: '20rem',
              overflowY: 'auto',
              paddingX: 4,
              paddingY: 2,
            }}
          />
        </Paper>
      </Stack>

      <Stack padding={0.5}>
        <Paper variant="outlined">
          <DatasetTabs datasets={datasets} />
        </Paper>
      </Stack>

      
    </>
  );
};
