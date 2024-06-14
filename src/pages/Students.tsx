import { useLoaderData } from 'react-router-dom';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  StudentCard,
} from 'components';
import { GetStudentsResponse } from 'db';

export const Students = () => {
  const response = useLoaderData() as GetStudentsResponse;
  return (
    <DashboardLayout
      breadcrumbs={<StudentsBreadcrumbs {...response} />}
      header={<StudentsHeader {...response} />}
      content={<StudentsContent {...response} />}
    />
  );
};

const StudentsBreadcrumbs = ({ group }: GetStudentsResponse) => {
  return (
    <DashboardBreadcrumbs
      title={group.title}
      links={[
        {
          href: '/dashboard/groups',
          children: 'Student Groups',
        },
      ]}
    />
  );
};

const StudentsHeader = ({
  group: { title, studentsCount },
}: GetStudentsResponse) => {
  return (
    <DashboardHeader
      heading={title}
      subtitle={`${studentsCount} student${studentsCount > 1 ? 's' : ''} in ${title}'s student group.`}
    />
  );
};

const StudentsContent = ({ students }: GetStudentsResponse) => {
  return (
    <Grid2 container rowSpacing={1} columnSpacing={1}>
      {students.map((student) => {
        return (
          <Grid2 key={student.id} xs={6} md={4} lg={3}>
            <StudentCard student={student} />
          </Grid2>
        );
      })}
    </Grid2>
  );
};
