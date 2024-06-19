import { Paper, Stack, Typography } from '@mui/material';
import { EditNoteRounded, TaskAltRounded } from '@mui/icons-material';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  DashboardSpeedDial,
  DatasetTabs,
} from 'components';
import { useUnitLoader } from 'hooks';

export const ViewUnit = () => {
  return (
    <DashboardLayout
      breadcrumbs={<Breadcrumbs />}
      header={<Header />}
      content={<Content />}
      speedDial={<SpeedDial />}
    />
  );
};

const Breadcrumbs = () => {
  const { activity, unit } = useUnitLoader();
  return (
    <DashboardBreadcrumbs
      title={unit.title}
      links={[
        {
          href: '/dashboard/activities',
          children: 'Activities',
        },
        {
          href: `/dashboard/activities/${activity.id}/units`,
          children: activity.title,
        },
      ]}
    />
  );
};

const Header = () => {
  const { unit } = useUnitLoader();
  return (
    <DashboardHeader
      heading={unit.title}
      subtitle="View this unit's description and datasets."
    />
  );
};

const Content = () => {
  const { unit, datasets } = useUnitLoader();
  return (
    <>
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

const SpeedDial = () => {
  return (
    <DashboardSpeedDial
      ariaLabel="ViewUnit SpeedDial"
      openIcon={<TaskAltRounded />}
      actions={[
        {
          icon: <EditNoteRounded />,
          tooltipTitle: 'Edit Unit',
        },
      ]}
    />
  );
};
