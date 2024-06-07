import { RecordModel } from 'pocketbase';

export type UserRole = 'Teacher' | 'Student';

export interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
}

export class Group {
  constructor(
    readonly model: RecordModel,
    readonly studentsCount: number = -1,
  ) {}

  get id(): string {
    return this.model.id;
  }

  get course(): string {
    return this.model.course;
  }

  get semester(): string {
    return this.model.semester;
  }

  get year(): number {
    return this.model.year;
  }

  get title(): string {
    const { course, semester, year } = this;
    return `${course}-${semester}-${year}`;
  }
}

export interface GetStudentsResponse {
  students: User[];
  group: Group;
}
