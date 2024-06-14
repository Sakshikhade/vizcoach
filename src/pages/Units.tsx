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

export const Units = () => {
  const response = useLoaderData() as GetUnitsResponse;
  return (
    <DashboardLayout
      breadcrumbs={<UnitsBreadcrumbs {...response} />}
      header={<UnitsHeader {...response} />}
      content={<UnitsContent {...response} />}
      speedDial={<UnitsSpeedDial {...response} />}
    />
  );
};

const UnitsBreadcrumbs = ({ activity }: GetUnitsResponse) => {
  return (
    <DashboardBreadcrumbs
      title={activity.title}
      links={[
        {
          href: '/dashboard/activities',
          children: 'Activities',
        },
      ]}
    />
  );
};

const UnitsHeader = ({ activity }: GetUnitsResponse) => {
  return (
    <DashboardHeader
      heading={activity.title}
      subtitle="Create, manage, and track activity's units."
    />
  );
};

const UnitsContent = ({ activity, units }: GetUnitsResponse) => {
  return (
    <>
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
        {units.map((unit) => {
          return (
            <Grid2 key={unit.id} xs={12} md={12} lg={12}>
              <UnitCard unit={unit} />
            </Grid2>
          );
        })}
      </Grid2>
    </>
  );
};

const UnitsSpeedDial = ({ activity }: GetUnitsResponse) => {
  const navigate = useNavigate();
  return (
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
          onClick: () => navigate(`../${activity.id}/submissions`),
        },
        {
          icon: <EditNoteRounded />,
          tooltipTitle: `Edit Activity`,
        },
      ]}
    />
  );
};
