import Pocketbase, { RecordModel } from 'pocketbase';
import {
  Activity,
  GetStudentsResponse,
  GetSubmissionsResponse,
  Group,
  Submission,
  Unit,
  User,
} from '.';

class PocketbaseClient {
  readonly pb: Pocketbase;

  constructor() {
    this.pb = new Pocketbase(process.env.REACT_APP_POCKETBASE_URL);
    this.pb.autoCancellation(process.env.NODE_ENV !== 'development');
  }

  async authWithPassword(email: string, password: string): Promise<void> {
    try {
      await this.pb.collection('users').authWithPassword(email, password);
    } catch (error) {
      console.error(error);
    }
  }

  clearAuthStore(): void {
    this.pb.authStore.clear();
  }

  getUser(): User | null {
    const { isValid, model } = this.pb.authStore;
    return isValid ? (model as User) : null;
  }

  async getGroups(): Promise<Group[]> {
    const models = await this.pb.collection('groups').getFullList({
      sort: '-created',
    });
    const groups: Group[] = [];
    for (const model of models) {
      groups.push(new Group(model, await this.getStudentsCount(model.id)));
    }
    return groups;
  }

  async getStudentsCount(groupId: string): Promise<number> {
    const response = await this.pb.collection('usergroups').getList(1, 1, {
      filter: `groupId='${groupId}' && userId.role='Student'`,
    });
    return response.totalItems;
  }

  async getStudents(groupId: string): Promise<GetStudentsResponse | null> {
    const user = this.getUser();
    if (!user || user.role !== 'Teacher') return null;

    const userGroups = await this.pb.collection('usergroups').getFullList({
      expand: 'userId,groupId',
      filter: `groupId='${groupId}' && userId.role='Student'`,
    });

    // Extracting user from the expanded collection
    const students = userGroups
      .map(({ expand }) => expand?.userId)
      .filter((user) => !!user);

    // Getting group from either the expanded collection or fetching new one
    const record: RecordModel = userGroups.length
      ? userGroups[0].expand?.groupId
      : await this.pb.collection('groups').getOne(groupId);

    return {
      group: new Group(record, students.length),
      students,
    };
  }

  async getActivities(): Promise<Activity[]> {
    const user = this.getUser();
    if (!user) return [];

    const activities: Activity[] = [];
    const models = await this.pb.collection('activities').getFullList({
      sort: '-created',
      expand: user.role === 'Teacher' ? 'groupId' : '',
      filter:
        user.role === 'Student'
          ? [
              `groupId.usergroups_via_groupId.userId='${user.id}'`,
              `(scheduled='' || scheduled<'${new Date().toISOString()}')`,
            ].join(' && ')
          : '',
    });
    for (const model of models) {
      activities.push(new Activity(model, await this.getUnitsCount(model.id)));
    }
    return activities;
  }

  async getUnitsCount(activityId: string): Promise<number> {
    const response = await this.pb.collection('units').getList(1, 1, {
      filter: `activityId='${activityId}'`,
    });
    return response.totalItems;
  }

  async getUnits(activityId: string): Promise<Unit[]> {
    return this.pb.collection('units').getFullList({
      sort: '+order',
      filter: `activityId='${activityId}'`,
    });
  }

  async getSubmissions(
    activityId: string,
  ): Promise<GetSubmissionsResponse | null> {
    const user = this.getUser();
    if (!user || user.role !== 'Teacher') return null;

    const units: Unit[] = await this.getUnits(activityId);
    const models = await this.pb.collection('submissions').getFullList({
      expand: 'userId,unitId.activityId.groupId',
      filter: `unitId.activityId='${activityId}'`,
    });

    if (!models.length) {
      const model = await this.pb.collection('activities').getOne(activityId, {
        expand: 'groupId',
      });
      return {
        activity: new Activity(model, units.length),
        units,
        submissions: [],
      };
    }
    return {
      activity: new Activity(
        models[0].expand?.unitId.expand.activityId,
        units.length,
      ),
      units,
      submissions: models.map((model) => new Submission(model)),
    };
  }
}

const client = new PocketbaseClient();
export default client;
