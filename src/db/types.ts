import { RecordModel } from 'pocketbase';

export type UserRole = 'Teacher' | 'Student';

export interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  token: string;
}

export interface Group extends RecordModel {
  course: string;
  semester: string;
  year: number;
  title?: string;
  studentsCount?: number;
}

export interface GetStudentsResponse {
  students: User[];
  group: Group;
}
