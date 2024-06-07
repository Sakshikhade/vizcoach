import { useLoaderData } from 'react-router-dom';
import { Stack } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { DashboardBreadcrumbs, DashboardHeader, StudentCard } from 'components';
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
      <DashboardHeader
        heading={title}
        subtitle={`${studentsCount} student${studentsCount > 1 ? 's' : ''} in ${title}'s student group.`}
      />
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
