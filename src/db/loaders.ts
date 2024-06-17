import { LoaderFunctionArgs } from 'react-router-dom';
import client from 'db';

export const groupsLoader = async () => client.getGroups();

export const studentsLoader = async ({
  params: { groupId },
}: LoaderFunctionArgs) => client.getStudents(groupId || '');

export const activitiesLoader = async () => client.getActivities();

export const unitLoader = async ({
  params: { activityId, unitId },
}: LoaderFunctionArgs) => await client.getUnit(activityId || '', unitId || '');

export const submissionsLoader = async ({
  params: { activityId },
}: LoaderFunctionArgs) => client.getSubmissions(activityId || '');

export const submissionLoader = async ({
  params: { activityId, unitId },
}: LoaderFunctionArgs) =>
  await client.getSubmission(activityId || '', unitId || '');
