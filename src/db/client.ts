import Pocketbase from 'pocketbase';
import { GridColDef } from '@mui/x-data-grid';
import { autoType, csv } from 'd3';
import {
  Activity,
  Comment,
  Dataset,
  DatasetRow,
  Group,
  Submission,
  Unit,
  UnsavedActivity,
  UnsavedGroup,
  UnsavedSubmission,
  UnsavedUnit,
  User,
} from 'db';

class PocketbaseClient {
  readonly pb: Pocketbase;

  constructor() {
    this.pb = new Pocketbase(process.env.REACT_APP_POCKETBASE_URL);
    this.pb.autoCancellation(process.env.NODE_ENV !== 'development');
  }

  async authWithPassword(email: string, password: string): Promise<void> {
    await this.pb.collection('users').authWithPassword(email, password);
  }

  clearAuthStore(): void {
    this.pb.authStore.clear();
  }

  getUser(): User | null {
    const { isValid, record } = this.pb.authStore;
    return isValid ? (record as any) : null;
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

  async getStudent(studentId: string): Promise<User | null> {
    const user = this.getUser();
    if (!user || user.role !== 'Teacher') return null;

    return this.pb.collection('users').getOne(studentId);
  }

  async getActivities(filter?: string): Promise<Activity[]> {
    const user = this.getUser();
    if (!user) return [];

    const filters = [];
    if (user.role === 'Student') {
      filters.push(
        `groupId.usergroups_via_groupId.userId?='${user.id}'`,
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

  async getStudentSubmissions(
    studentId: string,
    activityId: string,
  ): Promise<Submission[]> {
    return this.getSubmissions(activityId, `userId='${studentId}'`);
  }

  async getComments({ id }: Submission, filter?: string): Promise<Comment[]> {
    const filters = [`submissionId='${id}'`];
    if (filter) {
      filters.push(filter);
    }

    const models = await this.pb.collection('comments').getFullList({
      filter: filters.join(' && '),
      sort: '-created',
      expand: 'userId',
    });

    return models.map((model) => new Comment(model));
  }

  async getComment(
    submission: Submission,
    commentId: string,
  ): Promise<Comment | null> {
    const comments = await this.getComments(submission, `id='${commentId}'`);
    return comments.length ? comments[0] : null;
  }

  async createGroup(group: UnsavedGroup): Promise<Group | null> {
    try {
      const { id } = await this.pb.collection('groups').create(group);
      return this.getGroup(id);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async createActivity(activity: UnsavedActivity): Promise<Activity | null> {
    try {
      const { id } = await this.pb.collection('activities').create(activity);
      return this.getActivity(id);
    } catch {
      return null;
    }
  }

  async createUnit(unit: UnsavedUnit): Promise<Unit | null> {
    try {
      const { id } = await this.pb.collection('units').create(unit);
      return this.getUnit(unit.activityId!, id);
    } catch {
      return null;
    }
  }

  async createSubmission(
    activityId: string,
    unitId: string,
    unsavedSubmission: UnsavedSubmission,
  ): Promise<Submission> {
    const user = this.getUser();
    if (!user || user?.role !== 'Student') {
      throw new Error('Only logged-in student can create a submission!');
    }

    // Checking if student has access to the unit
    const unit = await this.getUnit(activityId, unitId);
    if (!unit) {
      throw new Error(
        `Either unit not found or you are not authorized to access it!`,
      );
    }

    // Creating submission's record in the database
    const { json, state } = unsavedSubmission;
    await this.pb.collection('submissions').create({
      json,
      unitId,
      userId: user.id,
      state,
    });

    // Fetching newly created submission
    const submission = await this.getSubmission(activityId, unitId);
    if (!submission) {
      throw new Error(`Unable to create new submissions!`);
    }
    return submission;
  }

  async updateSubmission(
    activityId: string,
    unitId: string,
    unsavedSubmission: UnsavedSubmission,
  ) {
    const user = this.getUser();
    if (!user || user?.role !== 'Student') {
      throw new Error('Only logged-in student can update submissions!');
    }

    const oldSubmission = await this.getSubmission(activityId, unitId);
    if (!oldSubmission) {
      throw new Error(
        `Either submission not found or you are not authorized to access it!`,
      );
    }

    // Updating submission's record in the database
    await this.pb.collection('submissions').update(oldSubmission.id, {
      ...unsavedSubmission,
      unitId,
      userId: user.id,
    });

    // Fetching updated submission
    const newSubmission = await this.getSubmission(activityId, unitId);
    if (!newSubmission) {
      throw new Error(`Unable to update submission!`);
    }
    return newSubmission;
  }

  async postComment(submission: Submission, content: string): Promise<Comment> {
    const user = this.getUser();
    if (!user) {
      throw new Error('Only logged-in users can post comments!');
    }

    const model = await this.pb.collection('comments').create(
      {
        userId: user.id,
        submissionId: submission.id,
        content,
      },
      {
        expand: 'userId',
      },
    );
    return new Comment(model);
  }

  async deleteActivity({ id }: Activity): Promise<void> {
    const user = this.getUser();
    if (!user || user.role !== 'Teacher') {
      throw new Error('Only logged-in teachers can delete activities!');
    }
    await this.pb.collection('activities').delete(id);
  }

  async deleteUnit({ id }: Unit): Promise<void> {
    const user = this.getUser();
    if (!user || user.role !== 'Teacher') {
      throw new Error('Only logged-in teachers can delete units!');
    }
    await this.pb.collection('units').delete(id);
  }

  registerPostCommentCallback(
    submission: Submission,
    callback: (comment: Comment) => void,
  ) {
    const user = this.getUser();
    if (
      !user ||
      (user.role === 'Student' && user.id !== submission.student.id)
    ) {
      throw new Error(
        'Only logged-in teachers or student who own the requested submission can subscribe to new comments!',
      );
    }
    this.pb
      .collection('comments')
      .subscribe('*', async ({ action, record }) => {
        // Only allowing create action to pass through callback
        if (action !== 'create') {
          console.warn(
            `Unsupported action '${action}' for post comment callback!`,
          );
          return;
        }

        // Checking if new comment is on the requested submission
        if (submission.id !== record.submissionId) {
          return;
        }

        const comment = await this.getComment(submission, record.id);
        if (comment) {
          callback(comment);
        }
      });
  }

  unregisterPostCommentCallback() {
    this.pb.collection('comments').unsubscribe('*');
  }
}

const client = new PocketbaseClient();
export default client;
