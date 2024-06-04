import { RecordModel } from 'pocketbase';

export interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  username: string;
  role: 'Teacher' | 'Student';
  token: string;
}

export interface Group extends RecordModel {
  course: string;
  semester: string;
  year: number;
}
