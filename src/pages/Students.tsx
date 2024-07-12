import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { DashboardLayout, StudentCard } from 'components';
import { useStudentsLoader } from 'hooks';

export const Students = () => {
  const { group, students } = useStudentsLoader();
  return (
    <DashboardLayout>
      <DashboardLayout.Breadcrumbs title={group.title}>
        <DashboardLayout.Breadcrumbs.Link href="/dashboard/groups">
          Student Groups
        </DashboardLayout.Breadcrumbs.Link>
      </DashboardLayout.Breadcrumbs>

      <DashboardLayout.Header
        heading={group.title}
        subtitle={`${group.studentsCount} student${group.studentsCount > 1 ? 's' : ''} in ${group.title}'s student group.`}
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
    </DashboardLayout>
  );
};
