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
    readonly model?: RecordModel,
    readonly studentsCount: number = -1,
  ) {}

  get valid(): boolean {
    return !!this.model;
  }

  get id(): string {
    return this.model?.id || 'unknown';
  }

  get course(): string {
    return this.model?.course || 'unknown';
  }

  get semester(): string {
    return this.model?.semester || 'unknown';
  }

  get year(): number {
    return this.model?.year || -1;
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

export class Activity {
  constructor(readonly model: RecordModel) {}

  get id(): string {
    return this.model.id;
  }

  get title(): string {
    return this.model.title;
  }

  get description(): string {
    return this.model.description;
  }

  get scheduled(): Date {
    return new Date(this.model.scheduled);
  }

  get isScheduled(): boolean {
    return !isNaN(this.scheduled.getTime()) && new Date() < this.scheduled;
  }

  get group(): Group {
    return new Group(this.model.expand?.groupId);
  }
}
