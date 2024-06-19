import { RecordModel } from 'pocketbase';
import { GridColDef } from '@mui/x-data-grid';

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
  constructor(
    readonly model: RecordModel,
    readonly unitsCount: number = -1,
  ) {}

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

export type DatasetRow = { [key: string]: any };

export interface Dataset {
  name: string;
  fields: GridColDef<DatasetRow>[];
  rows: DatasetRow[];
}

export interface Unit extends RecordModel {
  title: string;
  description: string;
  datasets: string[];
  order: number;
}

export interface GetUnitResponse {
  activity: Activity;
  unit: Unit;
  datasets: Dataset[];
}

export class Submission {
  constructor(
    readonly model: RecordModel,
    readonly student: User,
  ) {}

  get id(): string {
    return this.model.id;
  }

  get json(): object {
    return this.model.json;
  }

  get state(): 'help' | 'submitted' {
    return this.model.state;
  }

  get updated(): Date {
    return new Date(this.model.updated);
  }

  get unitId(): string {
    return this.model.unitId;
  }
}

export interface GetSubmissionsResponse {
  activity: Activity;
  units: Unit[];
  submissions: Submission[];
}

export interface GetSubmissionResponse extends GetUnitResponse {
  submission: Submission | null;
}

export const toTextContent = (innerHTML: string): string => {
  const element = document.createElement('div');
  element.innerHTML = innerHTML;
  return element.textContent || innerHTML;
};
