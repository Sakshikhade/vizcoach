import { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  SubmissionCard,
} from 'components';
import { Submission, User } from 'db';
import { useDatasets, useSubmissionsLoader } from 'hooks';

const ALL_UNITS = 'All Units';

export const Submissions = () => {
  const [unitId, setUnitId] = useState<string>(ALL_UNITS);
  return (
    <DashboardLayout
      breadcrumbs={<Breadcrumbs />}
      header={<Header unitId={unitId} setUnitId={setUnitId} />}
      content={<Content unitId={unitId} />}
    />
  );
};

const Breadcrumbs = () => {
  const { activity } = useSubmissionsLoader();
  return (
    <DashboardBreadcrumbs
      title="Submissions"
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

const Header = (props: FilterProps) => {
  const { activity } = useSubmissionsLoader();
  return (
    <DashboardHeader
      heading="Submissions"
      subtitle={`Track ${activity.group.title}'s submissions for ${activity.title}`}
      options={<Filter {...props} />}
    />
  );
};

type FilterProps = {
  unitId: string;
  setUnitId: (unitId: string) => void;
};

const Filter = ({ unitId, setUnitId }: FilterProps) => {
  const { units } = useSubmissionsLoader();
  return (
    <FormControl sx={{ width: '20rem', textOverflow: 'ellipsis' }}>
      <InputLabel id="units-select-label">Units</InputLabel>
      <Select
        labelId="units-select-label"
        value={unitId}
        input={<OutlinedInput id="filter-select" label="Chip" />}
        onChange={(event) => setUnitId(event.target.value)}
      >
        <MenuItem value={ALL_UNITS}>All Units</MenuItem>
        {units.map((unit) => {
          return (
            <MenuItem key={unit.id} value={unit.id}>
              {`Unit-${unit.order}: ${unit.title}`}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

type ContentProps = {
  unitId: string;
};

const Content = ({ unitId }: ContentProps) => {
  const { units, submissions } = useSubmissionsLoader();
  const selectedUnit = units.find(({ id }) => id === unitId);
  const datasets = useDatasets(selectedUnit);

  const students = submissions.reduce((map, submission) => {
    const { student } = submission;
    map.set(student, [...(map.get(student) || []), submission]);
    return map;
  }, new Map<User, Submission[]>());

  return (
    <Grid2 container rowSpacing={1} columnSpacing={1}>
      {[...students.entries()].map(([student, studentSubmissions]) => {
        return (
          <Grid2 key={student.id} xs={12} md={6} lg={4}>
            <SubmissionCard
              student={student}
              submissions={studentSubmissions}
              units={units}
              datasets={datasets}
              selectedUnit={selectedUnit}
            />
          </Grid2>
        );
      })}
    </Grid2>
  );
};
