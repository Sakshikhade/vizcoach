import Pocketbase, { RecordModel } from 'pocketbase';
import { GridColDef } from '@mui/x-data-grid';
import { autoType, csv } from 'd3';
import {
  Activity,
  Dataset,
  DatasetRow,
  GetStudentsResponse,
  GetSubmissionsResponse,
  GetUnitResponse,
  GetUnitsResponse,
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

  async getUnits(activityId: string): Promise<GetUnitsResponse | null> {
    const user = this.getUser();
    if (!user) return null;

    const units: Unit[] = await this.pb.collection('units').getFullList({
      sort: '+order',
      expand: 'activityId.groupId',
      filter: `activityId='${activityId}'`,
    });

    if (!units.length) {
      const model = await this.pb.collection('activities').getOne(activityId, {
        expand: 'groupId',
      });
      return {
        activity: new Activity(model, 0),
        units: [],
      };
    }
    return {
      activity: new Activity(units[0].expand?.activityId, units.length),
      units,
    };
  }

  async getUnit(
    activityId: string,
    unitId: string,
  ): Promise<GetUnitResponse | null> {
    const response = await this.getUnits(activityId);
    if (!response) return null;

    const { activity, units } = response;
    const unit = units.find(({ id }) => id === unitId);
    if (!unit) return null;

    return {
      activity,
      unit,
      datasets: await this.getDatasets(unit),
    };
  }

  private async getDatasets(unit: Unit): Promise<Dataset[]> {
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
  ): Promise<GetSubmissionsResponse | null> {
    const response = await this.getUnits(activityId);
    if (!response) return null;
    const { activity, units } = response;

    const user = this.getUser();
    if (!user) return null;

    const expands = ['unitId'];
    const filters = [`unitId.activityId='${activityId}'`];
    if (user.role !== 'Teacher') {
      filters.push(`userId='${user.id}'`);
    } else {
      expands.push('userId');
    }

    const models = await this.pb.collection('submissions').getFullList({
      expand: expands.join(','),
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
}

const client = new PocketbaseClient();
export default client;
