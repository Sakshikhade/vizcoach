import { useNavigate } from 'react-router-dom';
import { Paper, SpeedDialAction, Stack, Typography } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  EditNoteRounded,
  PlaylistAddCheckRounded,
  PlaylistAddRounded,
  TaskAltRounded,
} from '@mui/icons-material';
import { Dashboard, UnitCard } from 'components';
import { GetSubmissionsResponse, Submission } from 'db';
import { useDashboard } from 'hooks';

export const Units = () => {
  const { user, useData } = useDashboard();
  const { activity, units, submissions } = useData!<GetSubmissionsResponse>();
  const navigate = useNavigate();

  const submissionMap = submissions.reduce((map, submission) => {
    map.set(submission.unitId, submission);
    return map;
  }, new Map<string, Submission>());

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
      />

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

      {user?.role === 'Teacher' && (
        <Dashboard.SpeedDial label="Units SpeedDial" icon={<TaskAltRounded />}>
          <SpeedDialAction
            icon={<PlaylistAddRounded />}
            tooltipTitle="Add Unit"
            onClick={() => navigate(`../${activity.id}/add-unit`)}
          />
          <SpeedDialAction
            icon={<PlaylistAddCheckRounded />}
            tooltipTitle="View Submissions"
            onClick={() => navigate(`../${activity.id}/submissions`)}
          />
          <SpeedDialAction
            icon={<EditNoteRounded />}
            tooltipTitle="Edit Activity"
          />
        </Dashboard.SpeedDial>
      )}
    </>
  );
};
