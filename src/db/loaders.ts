import { LoaderFunctionArgs } from 'react-router-dom';
import client, {
  Comment,
  Dataset,
  GetActivityResponse,
  GetStudentsResponse,
  GetStudentSubmissionsResponse,
  GetSubmissionResponse,
  GetSubmissionsResponse,
  GetUnitResponse,
} from 'db';

export const groupsLoader = async () => client.getGroups();

export const studentsLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<GetStudentsResponse | null> => {
  const { groupId } = params;
  if (!groupId) return null;

  const [group, students] = await Promise.all([
    client.getGroup(groupId),
    client.getStudents(groupId),
  ]);

  if (!group) return null;
  return {
    group,
    students,
  };
};

export const activitiesLoader = async () => client.getActivities();

export const activityLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<GetActivityResponse | null> => {
  const { activityId } = params;
  if (!activityId) return null;

  const [activity, units] = await Promise.all([
    client.getActivity(activityId),
    client.getUnits(activityId),
  ]);
  if (!activity) return null;

  return { activity, units };
};

export const editActivityLoader = async ({ params }: LoaderFunctionArgs) => {
  const { activityId } = params;
  if (!activityId) return null;

  const [activity, groups] = await Promise.all([
    client.getActivity(activityId),
    client.getGroups(),
  ]);
  if (!activity) return null;

  return { activity, groups };
};

export const unitLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<GetUnitResponse | null> => {
  const { activityId, unitId } = params;
  if (!activityId || !unitId) return null;

  const [activity, unit] = await Promise.all([
    client.getActivity(activityId),
    client.getUnit(activityId, unitId),
  ]);

  if (!activity || !unit) return null;
  return {
    activity,
    unit,
    datasets: await client.getDatasets(unit),
  };
};

export const submissionsLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<GetSubmissionsResponse | null> => {
  const { activityId } = params;
  if (!activityId) return null;

  const [activity, units, submissions] = await Promise.all([
    client.getActivity(activityId),
    client.getUnits(activityId),
    client.getSubmissions(activityId),
  ]);

  if (!activity) return null;
  return {
    activity,
    units,
    submissions,
  };
};

export const submissionLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<GetSubmissionResponse | null> => {
  const { activityId, unitId } = params;
  if (!activityId || !unitId) return null;

  const [activity, unit, submission] = await Promise.all([
    client.getActivity(activityId),
    client.getUnit(activityId, unitId),
    client.getSubmission(activityId, unitId),
  ]);

  if (!activity || !unit) return null;
  const comments = submission ? await client.getComments(submission) : [];

  return {
    activity,
    unit,
    datasets: await client.getDatasets(unit),
    submission,
    comments,
  };
};

export const studentSubmissionsLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<GetStudentSubmissionsResponse | null> => {
  const { activityId, studentId } = params;
  if (!activityId || !studentId) return null;

  const [student, activity, units, submissions] = await Promise.all([
    client.getStudent(studentId),
    client.getActivity(activityId),
    client.getUnits(activityId),
    client.getStudentSubmissions(studentId, activityId),
  ]);

  if (!student || !activity) return null;

  const datasets = await Promise.all(
    units.map((unit) => client.getDatasets(unit)),
  );
  const unitDatasets = datasets.reduce(
    (record, dataset, index) =>
      Object.assign(record, { [units[index].id]: dataset }),
    {} as Record<string, Dataset[]>,
  );

  const comments = await Promise.all(
    submissions.map((submission) => client.getComments(submission)),
  );
  const submissionComments = comments.reduce(
    (record, comment, index) =>
      Object.assign(record, { [submissions[index].id]: comment }),
    {} as Record<string, Comment[]>,
  );

  return {
    activity,
    units,
    submissions,
    student,
    unitDatasets,
    submissionComments,
  };
};
