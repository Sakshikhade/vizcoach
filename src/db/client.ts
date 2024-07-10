import Pocketbase from 'pocketbase';
import { GridColDef } from '@mui/x-data-grid';
import { autoType, csv } from 'd3';
import {
  Activity,
  Dataset,
  DatasetRow,
  Group,
  Submission,
  Unit,
  UnsavedActivity,
  User,
} from 'db';

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

  async getGroups(filter?: string): Promise<Group[]> {
    const user = this.getUser();
    if (!user) return [];

    const filters = [];
    if (user.role === 'Student') {
      filters.push(`usergroups_via_groupId.userId='${user.id}'`);
    }
    if (filter) {
      filters.push(filter);
    }

    const groups: Group[] = [];
    const models = await this.pb.collection('groups').getFullList({
      sort: '-created',
      filter: filters.join(' && '),
    });
    for (const model of models) {
      const { totalItems } = await this.pb
        .collection('usergroups')
        .getList(1, 1, {
          filter: `groupId='${model.id}' && userId.role='Student'`,
        });
      groups.push(new Group(model, totalItems));
    }
    return groups;
  }

  async getGroup(groupId: string): Promise<Group | null> {
    const groups = await this.getGroups(`id='${groupId}'`);
    return groups.length ? groups[0] : null;
  }

  async getStudents(groupId: string): Promise<User[]> {
    const user = this.getUser();
    if (!user || user.role !== 'Teacher') return [];

    const userGroups = await this.pb.collection('usergroups').getFullList({
      expand: 'userId',
      filter: `groupId='${groupId}' && userId.role='Student'`,
    });
    return userGroups
      .map(({ expand }) => expand?.userId)
      .filter((user) => !!user);
  }

  async getActivities(filter?: string): Promise<Activity[]> {
    const user = this.getUser();
    if (!user) return [];

    const filters = [];
    if (user.role === 'Student') {
      filters.push(
        `groupId.usergroups_via_groupId.userId='${user.id}'`,
        `(scheduled='' || scheduled<'${new Date().toISOString()}')`,
      );
    }
    if (filter) {
      filters.push(filter);
    }

    const activities: Activity[] = [];
    const models = await this.pb.collection('activities').getFullList({
      sort: '-created',
      expand: user.role === 'Teacher' ? 'groupId' : '',
      filter: filters.join(' && '),
    });
    for (const model of models) {
      const { totalItems } = await this.pb.collection('units').getList(1, 1, {
        filter: `activityId='${model.id}'`,
      });
      activities.push(new Activity(model, totalItems));
    }
    return activities;
  }

  async getActivity(activityId: string): Promise<Activity | null> {
    const activities = await this.getActivities(`id='${activityId}'`);
    return activities.length ? activities[0] : null;
  }

  async getUnits(activityId: string, filter?: string): Promise<Unit[]> {
    const user = this.getUser();
    if (!user) return [];

    const filters = [`activityId='${activityId}'`];
    if (filter) {
      filters.push(filter);
    }

    return await this.pb.collection('units').getFullList({
      sort: '+order',
      filter: filters.join(' && '),
    });
  }

  async getUnit(activityId: string, unitId: string): Promise<Unit | null> {
    const units = await this.getUnits(activityId, `id='${unitId}'`);
    return units.length ? units[0] : null;
  }

  async getDatasets(unit: Unit): Promise<Dataset[]> {
    const token = await this.pb.files.getToken();
    const datasets: Dataset[] = [];

    for (const name of unit?.datasets) {
      const url = this.pb.getFileUrl(unit, name, { token });
      const rows = await csv(url, autoType);
      const columns: string[] = rows.columns;
      const fields: GridColDef<DatasetRow>[] = columns.map((field) => ({
        field,
        headerName: field,
        filterable: false,
      }));

      // Adding ID field
      if (!columns.includes('id')) {
        fields.unshift({
          field: 'id',
          headerName: 'Generated ID',
          hideable: true,
          filterable: false,
        });
        for (let i = 0; i < rows.length; i++) {
          Object.assign(rows[i], { id: `${i}-${name}` });
        }
      }

      datasets.push({
        name,
        fields,
        rows,
      });
    }
    return datasets;
  }

  async getSubmissions(
    activityId: string,
    filter?: string,
  ): Promise<Submission[]> {
    const user = this.getUser();
    if (!user) return [];

    const filters = [`unitId.activityId='${activityId}'`];
    if (user.role !== 'Teacher') {
      filters.push(`userId='${user.id}'`);
    }
    if (filter) {
      filters.push(filter);
    }

    const models = await this.pb.collection('submissions').getFullList({
      expand: user.role === 'Teacher' ? 'userId' : '',
      filter: filters.join(' && '),
    });
    return models.map(
      (model) =>
        new Submission(
          model,
          user.role === 'Teacher' ? model.expand?.userId : user,
        ),
    );
  }

  async getSubmission(
    activityId: string,
    unitId: string,
  ): Promise<Submission | null> {
    const submissions = await this.getSubmissions(
      activityId,
      `unitId='${unitId}'`,
    );
    return submissions.length ? submissions[0] : null;
  }

  async createActivity(activity: UnsavedActivity): Promise<Activity | null> {
    try {
      const { id } = await this.pb.collection('activities').create(activity);
      return this.getActivity(id);
    } catch {
      return null;
    }
  }
}

const client = new PocketbaseClient();
export default client;
