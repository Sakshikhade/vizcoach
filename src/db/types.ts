import { RecordModel } from 'pocketbase';

export interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  username: string;
  token: string;
}

export interface StudentGroup extends RecordModel {
  name: string;
}
