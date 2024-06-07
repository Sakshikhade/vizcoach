import { useLoaderData } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { DashboardBreadcrumbs, StudentCard } from 'components';
import { GetStudentsResponse } from 'db';

export const Students = () => {
  const { students, group } = useLoaderData() as GetStudentsResponse;
  const title = group.title || 'Unknown';
  const studentsCount = group.studentsCount || 0;
  return (
    <Stack spacing={4} marginY={4}>
      <DashboardBreadcrumbs
        title={title}
        links={[
          {
            href: '/dashboard/groups',
            children: 'Student Groups',
          },
        ]}
      />
      <Stack>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="subtitle1">
          {studentsCount} student{studentsCount > 1 ? 's' : ''} in {title}'s
          Student Group.
        </Typography>
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
