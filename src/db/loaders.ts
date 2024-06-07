import client from '.';

export const groupsLoader = async () => client.getGroups();

export const studentsLoader = async (groupId: string) =>
  client.getStudents(groupId);

export const activitiesLoader = async () => client.getActivities();
