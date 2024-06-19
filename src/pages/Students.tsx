import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  StudentCard,
} from 'components';
import { useStudentsLoader } from 'hooks';

export const Students = () => {
  return (
    <DashboardLayout
      breadcrumbs={<Breadcrumbs />}
      header={<Header />}
      content={<Content />}
    />
  );
};

const Breadcrumbs = () => {
  const { group } = useStudentsLoader();
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

const Header = () => {
  const {
    group: { title, studentsCount },
  } = useStudentsLoader();
  return (
    <DashboardHeader
      heading={title}
      subtitle={`${studentsCount} student${studentsCount > 1 ? 's' : ''} in ${title}'s student group.`}
    />
  );
};

const Content = () => {
  const { students } = useStudentsLoader();
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
