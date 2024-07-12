import { Paper, SpeedDialAction, Stack, Typography } from '@mui/material';
import { EditNoteRounded, TaskAltRounded } from '@mui/icons-material';
import { DashboardLayout, DatasetTabs } from 'components';
import { useUnitLoader } from 'hooks';

export const ViewUnit = () => {
  const { activity, unit, datasets } = useUnitLoader();
  return (
    <DashboardLayout>
      <DashboardLayout.Breadcrumbs title={unit.title}>
        <DashboardLayout.Breadcrumbs.Link href="/dashboard/activities">
          Activities
        </DashboardLayout.Breadcrumbs.Link>
        <DashboardLayout.Breadcrumbs.Link
          href={`/dashboard/activities/${activity.id}/units`}
        >
          {activity.title}
        </DashboardLayout.Breadcrumbs.Link>
      </DashboardLayout.Breadcrumbs>

      <DashboardLayout.Header
        heading={unit.title}
        subtitle="View this unit's description and datasets."
      />

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

      <DashboardLayout.SpeedDial
        label="ViewUnit SpeedDial"
        icon={<TaskAltRounded />}
      >
        <SpeedDialAction icon={<EditNoteRounded />} tooltipTitle="Edit Unit" />
      </DashboardLayout.SpeedDial>
    </DashboardLayout>
  );
};
