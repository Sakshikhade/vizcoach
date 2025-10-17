import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Dashboard, StudentCard } from 'components';
import { GetStudentsResponse } from 'db';
import { useDashboard } from 'hooks';

export const Students = () => {
  const { useData } = useDashboard();
  const { group, students } = useData!<GetStudentsResponse>();
  return (
    <>
      <Dashboard.Breadcrumbs title={group.title}>
        <Dashboard.Breadcrumbs.Link href="/dashboard/groups">
          Classes
        </Dashboard.Breadcrumbs.Link>
      </Dashboard.Breadcrumbs>

      <Dashboard.Header
        heading={group.title}
        subtitle={`${group.studentsCount} student${group.studentsCount > 1 ? 's' : ''} in ${group.title}'s class.`}
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
    </>
  );
};
