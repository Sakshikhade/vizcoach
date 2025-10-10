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

// Frontend alias for better UX
export type Class = Group;

export const UNSAVED_GROUP_FIELDS = [
  'course',
  'semester',
  'year',
  'csv+',
] as const;

export type UnsavedGroupField = (typeof UNSAVED_GROUP_FIELDS)[number];

export type UnsavedGroup = Partial<{
  course: string;
  semester: string;
  year: number;
  'csv+': File;
}>;

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

// Frontend alias for better UX
export type Assignment = Activity;

export const UNSAVED_ACTIVITY_REQUIRED_FIELDS = [
  'title',
  'description',
  'groupId',
] as const;

export const UNSAVED_ACTIVITY_FIELDS = [
  ...UNSAVED_ACTIVITY_REQUIRED_FIELDS,
  'scheduled',
] as const;

export type UnsavedActivityRequiredField =
  (typeof UNSAVED_ACTIVITY_REQUIRED_FIELDS)[number];

export type UnsavedActivityField = (typeof UNSAVED_ACTIVITY_FIELDS)[number];

export type UnsavedActivity = Partial<{
  [key in UnsavedActivityField]: string;
}>;

export interface GetActivityResponse {
  activity: Activity;
  units: Unit[];
}

// Frontend aliases for better UX
export type GetAssignmentResponse = GetActivityResponse;

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
  reference?: string | string[];
  order: number;
}

// Frontend alias for better UX
export type Task = Unit;

export type UnsavedUnit = Partial<{
  title: string;
  description: string;
  datasets: File[];
  reference: File[];
  activityId: string;
  order: number;
}>;

export type UnsavedUnitField = keyof UnsavedUnit;

export const UNSAVED_UNIT_REQUIRED_FIELDS = [
  'title',
  'description',
  'datasets',
] as const;

export interface GetUnitResponse {
  activity: Activity;
  unit: Unit;
  datasets: Dataset[];
}

// Frontend aliases for better UX
export type GetTaskResponse = GetUnitResponse;

export type SubmissionState = 'help' | 'submitted' | null;

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

  get state(): SubmissionState {
    return this.model.state;
  }

  get updated(): Date {
    return new Date(this.model.updated);
  }

  get unitId(): string {
    return this.model.unitId;
  }
}

export type UnsavedSubmission = {
  json: object;
  state?: SubmissionState;
};

export class Comment {
  constructor(readonly model: RecordModel) {}

  get id(): string {
    return this.model.id;
  }

  get content(): string {
    return this.model.content;
  }

  get user(): User | undefined {
    return this.model.expand?.userId;
  }
}

export interface GetSubmissionsResponse extends GetActivityResponse {
  submissions: Submission[];
}

export interface GetStudentSubmissionsResponse extends GetSubmissionsResponse {
  student: User;
  unitDatasets: Record<string, Dataset[]>;
  submissionComments: Record<string, Comment[]>;
}

export interface GetSubmissionResponse extends GetUnitResponse {
  submission: Submission | null;
  comments: Comment[];
}

export const toTextContent = (innerHTML: string): string => {
  const element = document.createElement('div');
  element.innerHTML = innerHTML;
  return element.textContent || innerHTML;
};



