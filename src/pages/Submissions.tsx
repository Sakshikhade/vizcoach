import { useLoaderData } from 'react-router-dom';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  DashboardBreadcrumbs,
  DashboardHeader,
  DashboardLayout,
  SubmissionCard,
} from 'components';
import { GetSubmissionsResponse, Submission, User } from 'db';

export const Submissions = () => {
  const response = useLoaderData() as GetSubmissionsResponse;
  return (
    <DashboardLayout
      breadcrumbs={<SubmissionsBreadcrumbs {...response} />}
      header={<SubmissionsHeader {...response} />}
      content={<SubmissionsContent {...response} />}
    />
  );
};

const SubmissionsBreadcrumbs = ({ activity }: GetSubmissionsResponse) => {
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

const SubmissionsHeader = ({ activity }: GetSubmissionsResponse) => {
  return (
    <DashboardHeader
      heading="Submissions"
      subtitle={`Track ${activity.group.title}'s submissions for ${activity.title}`}
    />
  );
};

const SubmissionsContent = ({ units, submissions }: GetSubmissionsResponse) => {
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
            />
          </Grid2>
        );
      })}
    </Grid2>
  );
};
