import { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Dashboard, SubmissionCard } from 'components';
import { GetSubmissionsResponse, Submission, User } from 'db';
import { useDashboard, useDatasets } from 'hooks';

const ALL_UNITS = 'All Units';

export const Submissions = () => {
  const { useData } = useDashboard();
  const { activity, units, submissions } = useData!<GetSubmissionsResponse>();
  const [unitId, setUnitId] = useState<string>(ALL_UNITS);

  const selectedUnit = units.find(({ id }) => id === unitId);
  const datasets = useDatasets(selectedUnit);

  const students = submissions.reduce((map, { student }) => {
    map.set(student.id, student);
    return map;
  }, new Map<string, User>());

  const studentSubmissions = submissions.reduce((map, submission) => {
    const {
      student: { id },
    } = submission;
    map.set(id, [...(map.get(id) || []), submission]);
    return map;
  }, new Map<string, Submission[]>());

  return (
    <>
      <Dashboard.Breadcrumbs title="Submissions">
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
        heading="Submissions"
        subtitle={`Track ${activity.group.title}'s submissions for ${activity.title}`}
      >
        <FormControl sx={{ width: '20rem', textOverflow: 'ellipsis' }}>
          <InputLabel id="units-select-label">Units</InputLabel>
          <Select
            labelId="units-select-label"
            value={unitId}
            input={<OutlinedInput id="filter-select" label="Chip" />}
            onChange={(event) => setUnitId(event.target.value)}
          >
            <MenuItem value={ALL_UNITS}>{ALL_UNITS}</MenuItem>
            {units.map((unit) => {
              return (
                <MenuItem key={unit.id} value={unit.id}>
                  {`Unit-${unit.order}: ${unit.title}`}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Dashboard.Header>

      <Grid2 container rowSpacing={1} columnSpacing={1}>
        {[...students.entries()].map(([studentId, student]) => {
          return (
            <Grid2 key={studentId} xs={12} md={6} lg={4}>
              <SubmissionCard
                student={student}
                submissions={studentSubmissions.get(studentId) || []}
                units={units}
                datasets={datasets}
                selectedUnit={selectedUnit}
              />
            </Grid2>
          );
        })}
      </Grid2>
    </>
  );
};
