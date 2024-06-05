import { useLoaderData } from 'react-router-dom';
import { Home, NavigateNext } from '@mui/icons-material';
import {
  Breadcrumbs,
  FormControl,
  InputLabel,
  Link,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { StudentCard } from 'components';
import { GetStudentsResponse } from 'db';

export const Students = () => {
  const { students, group } = useLoaderData() as GetStudentsResponse;
  const title = group.title || 'Unknown';
  const studentsCount = group.studentsCount || 0;
  return (
    <Stack spacing={4} marginY={4}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
        <Link
          underline="none"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home fontSize="inherit" />
        </Link>
        <Link underline="hover" color="inherit" href="/dashboard/groups">
          Student Groups
        </Link>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="subtitle1">
            {studentsCount} student{studentsCount > 1 ? 's' : ''} in {title}'s
            Student Group.
          </Typography>
        </Stack>
        <FormControl>
          <InputLabel id="filter-select-label">Filter</InputLabel>
          <Select
            labelId="filter-select-label"
            multiple
            input={<OutlinedInput id="filter-select" label="Chip" />}
          ></Select>
        </FormControl>
      </Stack>
      <Grid2 container rowSpacing={1} columnSpacing={1}>
        {students.map((student) => {
          return (
            <Grid2 key={student.id} xs={6} md={4} lg={3}>
              <StudentCard student={student} />
            </Grid2>
          );
        })}
      </Grid2>
    </Stack>
  );
};
