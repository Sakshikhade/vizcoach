import { useLoaderData, useNavigate } from 'react-router-dom';
import { Paper, Stack, Typography } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  EditNoteRounded,
  PlaylistAddCheckRounded,
  PlaylistAddRounded,
  TaskAltRounded,
} from '@mui/icons-material';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  DashboardSpeedDial,
  UnitCard,
} from 'components';
import { GetUnitsResponse } from 'db';
import { useAuth } from 'hooks';

export const Units = () => {
  const { activity, units } = useLoaderData() as GetUnitsResponse;
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <DashboardLayout
      breadcrumbs={
        <DashboardBreadcrumbs
          title={activity.title}
          links={[
            {
              href: '/dashboard/activities',
              children: 'Activities',
            },
          ]}
        />
      }
      header={
        <DashboardHeader
          heading={activity.title}
          subtitle={
            user?.role === 'Teacher'
              ? "Create, manage, and track activity's units."
              : "Track and submit activity's units."
          }
        />
      }
      content={
        <>
          <Stack padding={0.5}>
            <Paper variant="outlined">
              <Typography
                variant="subtitle1"
                dangerouslySetInnerHTML={{ __html: activity.description }}
                sx={{
                  minHeight: '20rem',
                  maxHeight: '20rem',
                  overflowY: 'auto',
                  paddingX: 4,
                }}
              />
            </Paper>
          </Stack>
          <Grid2 container rowSpacing={1} columnSpacing={1}>
            {units.map((unit) => {
              return (
                <Grid2 key={unit.id} xs={12} md={12} lg={12}>
                  <UnitCard unit={unit} />
                </Grid2>
              );
            })}
          </Grid2>
        </>
      }
      speedDial={
        user?.role === 'Teacher' && (
          <DashboardSpeedDial
            ariaLabel="Units SpeedDial"
            openIcon={<TaskAltRounded />}
            actions={[
              {
                icon: <PlaylistAddRounded />,
                tooltipTitle: 'Add Unit',
              },
              {
                icon: <PlaylistAddCheckRounded />,
                tooltipTitle: 'View Submissions',
                onClick: () => navigate('submissions'),
              },
              {
                icon: <EditNoteRounded />,
                tooltipTitle: `Edit Activity`,
              },
            ]}
          />
        )
      }
    />
  );
};
