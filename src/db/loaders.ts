import { LoaderFunctionArgs } from 'react-router-dom';
import client, { GetStudentsResponse, GetUnitResponse } from 'db';

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
  params: { activityId },
}: LoaderFunctionArgs) => client.getSubmissions(activityId || '');

export const submissionLoader = async ({
  params: { activityId, unitId },
}: LoaderFunctionArgs) =>
  await client.getSubmission(activityId || '', unitId || '');
