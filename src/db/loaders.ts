import { LoaderFunctionArgs } from 'react-router-dom';
import client, {
  GetStudentsResponse,
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
  return {
    activity,
    unit,
    datasets: await client.getDatasets(unit),
    submission,
  };
};
