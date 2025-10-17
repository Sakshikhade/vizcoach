import { useNavigate } from 'react-router-dom';
import { Paper, Stack, Typography, IconButton, Tooltip } from '@mui/material';
import {
  DeleteRounded,
  EditNoteRounded,
} from '@mui/icons-material';
import { Dashboard, DatasetTabs, ImageGallery } from 'components';
import client, { GetUnitResponse } from 'db';
import { useDashboard } from 'hooks';

export const ViewUnit = () => {
  const { useData } = useDashboard();
  const { activity, unit, datasets } = useData!<GetUnitResponse>();
  const navigate = useNavigate();

  const onUnitDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this task? This action will delete students' submissions too.",
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
          Assignments
        </Dashboard.Breadcrumbs.Link>
        <Dashboard.Breadcrumbs.Link
          href={`/dashboard/activities/${activity.id}/units`}
        >
          {activity.title}
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading={unit.title}
        subtitle="View this task's description and datasets."
      >
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Task">
            <IconButton
              onClick={() => navigate(`/dashboard/activities/${activity.id}/units/${unit.id}/edit-unit`)}
              color="primary"
            >
              <EditNoteRounded />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Task">
            <IconButton
              onClick={onUnitDelete}
              color="error"
            >
              <DeleteRounded />
            </IconButton>
          </Tooltip>
        </Stack>
      </Dashboard.Header>

      <Stack padding={0.5}>
        <Paper variant="outlined">
          <Typography
            dangerouslySetInnerHTML={{ __html: unit.description }}
            sx={{
              minHeight: 'auto',
              maxHeight: '30rem',
              overflowY: 'auto',
              paddingX: 4,
              paddingY: 2,
            }}
          />
        </Paper>
      </Stack>

      {/* Reference Images Section */}
      {unit.reference && unit.reference.length > 0 && (
        <Stack padding={0.5}>
          <Paper variant="outlined" sx={{ padding: 3 }}>
            <ImageGallery
              record={unit}
              imageNames={Array.isArray(unit.reference) ? unit.reference : [unit.reference]}
              title="Reference Images"
            />
          </Paper>
        </Stack>
      )}

      <Stack padding={0.5}>
        <Paper variant="outlined">
          <DatasetTabs datasets={datasets} />
        </Paper>
      </Stack>
    </>
  );
};
