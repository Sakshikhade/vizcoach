import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  DeleteRounded,
  EditNoteRounded,
  PlaylistAddCheckRounded,
  PlaylistAddRounded,
  MoreVert,
  TaskAltRounded,
} from '@mui/icons-material';
import { Dashboard, UnitCard } from 'components';
import client, { GetSubmissionsResponse, Submission } from 'db';
import { useDashboard } from 'hooks';

export const Units = () => {
  const { user, useData } = useDashboard();
  const { activity, units, submissions } = useData!<GetSubmissionsResponse>();
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const submissionMap = submissions.reduce((map, submission) => {
    map.set(submission.unitId, submission);
    return map;
  }, new Map<string, Submission>());

  const onDeleteActivity = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this activity and associated units? This action will delete students' submissions too.",
      )
    ) {
      try {
        await client.deleteActivity(activity);
        navigate('/dashboard/activities');
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
      <Dashboard.Breadcrumbs title={activity.title}>
        <Dashboard.Breadcrumbs.Link href="/dashboard/activities">
          Activities
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading={activity.title}
        subtitle={
          user?.role === 'Teacher'
            ? "Create, manage, and track activity's units."
            : 'Track your progress for this activity.'
        }
      >
        {user?.role === 'Teacher' && (
          <>
            <IconButton aria-label="activity actions" onClick={openMenu}>
              <MoreVert sx={{ color: 'black' }} />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={closeMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => {
                  closeMenu();
                  navigate(`../${activity.id}/add-unit`);
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'grey.200', width: 28, height: 28 }}>
                    <PlaylistAddRounded
                      fontSize="small"
                      sx={{ color: 'black' }}
                    />
                  </Avatar>
                </ListItemIcon>
                Add Unit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  closeMenu();
                  navigate(`../${activity.id}/submissions`);
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'grey.200', width: 28, height: 28 }}>
                    <PlaylistAddCheckRounded
                      fontSize="small"
                      sx={{ color: 'black' }}
                    />
                  </Avatar>
                </ListItemIcon>
                View Submissions
              </MenuItem>
              <MenuItem
                onClick={() => {
                  closeMenu();
                  navigate(`../${activity.id}/edit-activity`);
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'grey.200', width: 28, height: 28 }}>
                    <EditNoteRounded fontSize="small" sx={{ color: 'black' }} />
                  </Avatar>
                </ListItemIcon>
                Edit Activity
              </MenuItem>
              <MenuItem
                onClick={() => {
                  closeMenu();
                  onDeleteActivity();
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'grey.200', width: 28, height: 28 }}>
                    <DeleteRounded fontSize="small" sx={{ color: 'black' }} />
                  </Avatar>
                </ListItemIcon>
                Delete Activity
              </MenuItem>
            </Menu>
          </>
        )}
      </Dashboard.Header>

      <Stack padding={0.5}>
        <Paper variant="outlined">
          <Typography
            dangerouslySetInnerHTML={{ __html: activity.description }}
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

      <Grid2 container rowSpacing={1} columnSpacing={1}>
        {units.map((unit, index) => {
          return (
            <Grid2 key={unit.id} xs={12} md={12} lg={12}>
              <UnitCard
                unit={unit}
                submission={
                  user?.role !== 'Teacher'
                    ? submissionMap.get(unit.id) || null
                    : null
                }
                locked={
                  user?.role !== 'Teacher' &&
                  index !== 0 &&
                  submissionMap.get(units[index - 1].id)?.state !== 'submitted'
                }
              />
            </Grid2>
          );
        })}
      </Grid2>
    </>
  );
};
