import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { EditNoteRounded, TaskAltRounded } from '@mui/icons-material';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  DashboardSpeedDial,
  DatasetTable,
} from 'components';
import { GetUnitResponse } from 'db';

const useUnit = () => useLoaderData() as GetUnitResponse;

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
  const { activity, unit } = useUnit();
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
  const { unit } = useUnit();
  return (
    <DashboardHeader
      heading={unit.title}
      subtitle="View this unit's description and datasets."
    />
  );
};

const Content = () => {
  const { unit, datasets } = useUnit();
  const [index, setIndex] = useState(0);
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
          <Tabs
            value={index}
            onChange={(_, index) => setIndex(index)}
            aria-label="Datasets Tabs"
          >
            {unit.datasets.map((dataset, index) => (
              <Tab key={dataset} label={dataset} value={index} />
            ))}
          </Tabs>
          <DatasetTable dataset={datasets[index]} />
        </Paper>
      </Stack>
    </>
  );
};

const SpeedDial = () => {
  return (
    <DashboardSpeedDial
      ariaLabel="UnitPage SpeedDial"
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
