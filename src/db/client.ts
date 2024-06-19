import Pocketbase, { RecordModel } from 'pocketbase';
import { GridColDef } from '@mui/x-data-grid';
import { autoType, csv } from 'd3';
import {
  Activity,
  Dataset,
  DatasetRow,
  GetStudentsResponse,
  GetSubmissionResponse,
  GetSubmissionsResponse,
  Group,
  Submission,
  Unit,
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
  ): Promise<GetSubmissionsResponse | null> {
    const user = this.getUser();
    if (!user) return null;

    const activity = await this.getActivity(activityId);
    if (!activity) return null;

    const units = await this.getUnits(activityId);
    if (!units.length) return null;

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

    if (!models.length) {
      return {
        activity,
        units,
        submissions: [],
      };
    }
    return {
      activity,
      units,
      submissions: models.map(
        (model) =>
          new Submission(
            model,
            user.role === 'Teacher' ? model.expand?.userId : user,
          ),
      ),
    };
  }

  async getSubmission(
    activityId: string,
    unitId: string,
  ): Promise<GetSubmissionResponse | null> {
    const response = await this.getSubmissions(
      activityId,
      `unitId='${unitId}'`,
    );
    if (!response) return null;

    const { activity, units, submissions } = response;
    const unit = units.find(({ id }) => id === unitId)!;
    return {
      activity,
      unit,
      datasets: await this.getDatasets(unit),
      submission: submissions.length ? submissions[0] : undefined,
    };
  }
}

const client = new PocketbaseClient();
export default client;
