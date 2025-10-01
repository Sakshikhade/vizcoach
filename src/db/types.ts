import { RecordModel } from 'pocketbase';
import { GridColDef } from '@mui/x-data-grid';

export type UserRole = 'Teacher' | 'Student';

export class User {
  constructor(readonly model: RecordModel) {}

  get id(): string { return this.model.id; }
  get avatar(): string { return this.model.avatar || ''; }
  get name(): string { return this.model.name || this.model.username || 'Unknown'; }
  get email(): string { return this.model.email || ''; }
  get username(): string { return this.model.username || ''; }
  get role(): UserRole { return this.model.role || 'Student'; }
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

export type UnsavedUnit = Partial<{
  title: string;
  description: string;
  datasets: File[];
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

// Chat System Types
export type ChatRoomType = 'group' | 'private';

export class ChatRoom {
  constructor(readonly model: RecordModel) {}

  get id(): string {
    return this.model.id;
  }

  get name(): string {
    return this.model.name;
  }

  get type(): ChatRoomType {
    return this.model.type;
  }

  get description(): string {
    return this.model.description;
  }

  get groupId(): string | undefined {
    return this.model.groupId;
  }

  get participants(): string[] {
    // Parse JSON string if it's a string, otherwise return as array
    if (typeof this.model.participants === 'string') {
      try {
        return JSON.parse(this.model.participants);
      } catch {
        return [];
      }
    }
    return this.model.participants || [];
  }

  get createdBy(): string {
    return this.model.createdBy;
  }

  get isActive(): boolean {
    return this.model.isActive;
  }

  get created(): Date {
    return new Date(this.model.created);
  }

  get updated(): Date {
    return new Date(this.model.updated);
  }

  get group(): Group | undefined {
    return this.model.expand?.groupId;
  }

  get creator(): User | undefined {
    return this.model.expand?.createdBy;
  }
}

export class GroupChat {
  constructor(readonly model: RecordModel) {}

  get id(): string {
    return this.model.id;
  }

  get name(): string {
    return this.model.name;
  }

  get description(): string {
    return this.model.description;
  }

  get groupId(): string {
    return this.model.groupId;
  }

  get participants(): string[] {
    // Parse JSON string if it's a string, otherwise return as array
    if (typeof this.model.participants === 'string') {
      try {
        return JSON.parse(this.model.participants);
      } catch {
        return [];
      }
    }
    return this.model.participants || [];
  }

  get createdBy(): string {
    return this.model.createdBy;
  }

  get isActive(): boolean {
    return this.model.isActive;
  }

  get created(): Date {
    return new Date(this.model.created);
  }

  get updated(): Date {
    return new Date(this.model.updated);
  }

  get group(): Group | undefined {
    return this.model.expand?.groupId;
  }

  get creator(): User | undefined {
    return this.model.expand?.createdBy;
  }
}

export type ChatMessageType = 'text' | 'system';

export class ChatMessage {
  constructor(readonly model: RecordModel) {}

  get id(): string {
    return this.model.id;
  }

  get roomId(): string {
    return this.model.roomId;
  }

  get userId(): string {
    return this.model.userId;
  }

  get content(): string {
    return this.model.content;
  }

  get type(): ChatMessageType {
    return this.model.type || 'text';
  }

  get replyTo(): string | undefined {
    return this.model.replyTo;
  }

  get created(): Date {
    return new Date(this.model.created);
  }

  get updated(): Date {
    return new Date(this.model.updated);
  }

  get user(): User | undefined {
    return this.model.expand?.userId;
  }

  get room(): ChatRoom | undefined {
    return this.model.expand?.roomId;
  }

  get replyToMessage(): ChatMessage | undefined {
    return this.model.expand?.replyTo;
  }
}

export type UnsavedChatRoom = {
  name: string;
  type: ChatRoomType;
  description?: string;
  groupId?: string;
  participants: string[];
};

export type UnsavedChatMessage = {
  roomId: string;
  content: string;
  type?: ChatMessageType;
  replyTo?: string;
};

export interface GetChatRoomsResponse {
  rooms: ChatRoom[];
}

export interface GetChatRoomResponse {
  room: ChatRoom;
  messages: ChatMessage[];
}

export interface GetChatMessagesResponse {
  messages: ChatMessage[];
}