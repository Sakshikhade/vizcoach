import { LoaderFunctionArgs } from 'react-router-dom';
import client from '.';

export const groupsLoader = async () => client.getGroups();

export const studentsLoader = async ({ params }: LoaderFunctionArgs) =>
  client.getStudents(params.groupId || '');

export const activitiesLoader = async () => client.getActivities();

export const unitsLoader = async ({ params }: LoaderFunctionArgs) =>
  client.getUnits(params.activityId || '');

export const submissionsLoader = async ({ params }: LoaderFunctionArgs) =>
  client.getSubmissions(params.activityId || '');
