import { useNavigate } from 'react-router-dom';
import { Paper, SpeedDialAction, Stack, Typography } from '@mui/material';
import {
  DeleteRounded,
  EditNoteRounded,
  TaskAltRounded,
} from '@mui/icons-material';
import { Dashboard, DatasetTabs } from 'components';
import client, { GetUnitResponse } from 'db';
import { useDashboard } from 'hooks';

export const ViewUnit = () => {
  const { useData } = useDashboard();
  const { activity, unit, datasets } = useData!<GetUnitResponse>();
  const navigate = useNavigate();

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

      <Dashboard.SpeedDial label="ViewUnit SpeedDial" icon={<TaskAltRounded />}>
        <SpeedDialAction
          icon={<EditNoteRounded />}
          tooltipTitle="Edit Unit"
          onClick={() => navigate(`../${unit.id}/edit-unit`)}
        />
        <SpeedDialAction
          icon={<DeleteRounded />}
          tooltipTitle="Delete Unit"
          onClick={onUnitDelete}
        />
      </Dashboard.SpeedDial>
    </>
  );
};
