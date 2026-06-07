import Pocketbase from 'pocketbase';
import { GridColDef } from '@mui/x-data-grid';
import { autoType, csv } from 'd3';
import {
  Activity,
  ChatMessage,
  ChatRoom,
  Comment,
  Dataset,
  DatasetRow,
  Group,
  Material,
  Submission,
  Unit,
  UnsavedActivity,
  UnsavedChatMessage,
  UnsavedChatRoom,
  UnsavedGroup,
  UnsavedMaterial,
  UnsavedSubmission,
  UnsavedUnit,
  User,
  UserRole,
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

  async authWithGoogle(): Promise<void> {
    await this.pb.collection('users').authWithOAuth2({ provider: 'google' });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.pb.collection('users').requestPasswordReset(email);
  }

  async registerUser(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<void> {
    // PocketBase requires a non-blank username — derive one from the email
    // local part and append a random suffix to avoid collisions.
    const localPart = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${localPart}_${suffix}`;

    await this.pb.collection('users').create({
      name,
      username,
      email,
      password,
      passwordConfirm: password,
      role,
    });
    // Auto-authenticate after successful registration
    await this.pb.collection('users').authWithPassword(email, password);
  }
  async createUserAdmin(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<void> {
    const localPart = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${localPart}_${suffix}`;

    await this.pb.collection('users').create({
      name,
      username,
      email,
      password,
      passwordConfirm: password,
      role,
    });
  }

  clearAuthStore(): void {
    this.pb.authStore.clear();
  }

  getUser(): User | null {
    const { isValid, record } = this.pb.authStore;
    return isValid ? (record as any) : null;
  }

  // Get classes (groups) - teachers see only their own; students see only enrolled classes
  async getGroups(filter?: string): Promise<Group[]> {
    const user = this.getUser();
    if (!user) return [];

    const filters = [];
    if (user.role === 'Teacher') {
      // Only fetch groups owned by this teacher
      filters.push(`teacherId='${user.id}'`);
    } else {
      // Students only see their enrolled groups
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

  // Get a specific class (group) by ID
  async getGroup(groupId: string): Promise<Group | null> {
    const groups = await this.getGroups(`id='${groupId}'`);
    return groups.length ? groups[0] : null;
  }

  // Get students enrolled in a specific class
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

  // Get assignments (activities) - teachers see only their own; students see only assigned work
  async getActivities(filter?: string): Promise<Activity[]> {
    const user = this.getUser();
    if (!user) return [];

    const filters = [];
    if (user.role === 'Teacher') {
      // Only activities that belong to a group owned by this teacher
      filters.push(`groupId.teacherId='${user.id}'`);
    } else {
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
      const url = this.pb.files.getURL(unit, name, { token });
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

  async getSubmissionById(submissionId: string): Promise<Submission | null> {
    const user = this.getUser();
    if (!user) return null;
    try {
      const model = await this.pb
        .collection('submissions')
        .getOne(submissionId, {
          expand: user.role === 'Teacher' ? 'userId' : '',
        });
      const student =
        user.role === 'Teacher' ? (model as any).expand?.userId : user;
      return new Submission(model, student as any);
    } catch {
      return null;
    }
  }

  async createGroup(group: UnsavedGroup): Promise<Group | null> {
    const user = this.getUser();
    try {
      // Attach the current teacher's ID so ownership is enforced
      const { id } = await this.pb.collection('groups').create({
        ...group,
        teacherId: user?.id,
      });
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

  async updateActivity(activity: Activity): Promise<Activity | null> {
    try {
      const updateData: any = {
        title: activity.title,
        description: activity.description,
        groupId: activity.group.id,
      };

      // Only include scheduled if it's a valid date
      if (activity.scheduled && !isNaN(activity.scheduled.getTime())) {
        updateData.scheduled = activity.scheduled.toISOString();
      }

      await this.pb.collection('activities').update(activity.id, updateData);
      return this.getActivity(activity.id);
    } catch {
      return null;
    }
  }

  async updateUnit(unit: Unit): Promise<Unit | null> {
    try {
      const updateData: any = {
        title: unit.title,
        description: unit.description,
        datasets: unit.datasets,
      };

      // Only include reference if it exists
      if (unit.reference) {
        updateData.reference = unit.reference;
      }

      console.log('Updating unit with data:', updateData);
      await this.pb.collection('units').update(unit.id, updateData);
      return this.getUnit(unit.activityId, unit.id);
    } catch (error) {
      console.error('Error updating unit:', error);
      return null;
    }
  }

  async createSubmission(
    activityId: string,
    unitId: string,
    unsavedSubmission: UnsavedSubmission,
  ): Promise<Submission> {
    console.log('createSubmission called with:', {
      activityId,
      unitId,
      unsavedSubmission,
    });
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
    const { json, state, context } = unsavedSubmission;
    const payload: any = {
      json,
      unitId,
      userId: user.id,
      attempt: 1, // Default to attempt 1 for new submissions
      context: context || '',
    };
    // PocketBase select field: clear by sending empty string
    if (state === 'help' || state === 'submitted') {
      payload.state = state;
    } else {
      payload.state = '';
    }
    console.log(
      'About to create submission with payload:',
      JSON.stringify(payload, null, 2),
    );
    try {
      await this.pb.collection('submissions').create(payload);
      console.log('Submission created successfully');
    } catch (error) {
      console.error('Detailed error creating submission:', error);
      if (error && typeof error === 'object' && 'status' in error) {
        console.error('Error details:', {
          status: (error as any).status,
          data: (error as any).data,
          message: (error as any).message,
          url: (error as any).url,
        });
      }
      throw error;
    }

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
    console.log('updateSubmission called with:', {
      activityId,
      unitId,
      unsavedSubmission,
    });
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
    const updatePayload: any = {
      json: unsavedSubmission.json,
      unitId,
      userId: user.id,
      attempt: oldSubmission.attempt || 1, // Keep existing attempt or default to 1
      context: unsavedSubmission.context || '',
    };
    // PocketBase select field: clear by sending empty string
    if (
      unsavedSubmission.state === 'help' ||
      unsavedSubmission.state === 'submitted'
    ) {
      updatePayload.state = unsavedSubmission.state;
    } else {
      updatePayload.state = '';
    }
    await this.pb
      .collection('submissions')
      .update(oldSubmission.id, updatePayload);

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
    try {
      this.pb.collection('comments').unsubscribe('*');
    } catch (error) {
      console.warn('Failed to unsubscribe from comments:', error);
    }
  }

  registerSubmissionUpdateCallback(
    submissionId: string,
    callback: (submission: Submission) => void,
  ) {
    const user = this.getUser();
    if (!user) {
      throw new Error('Only logged-in users can subscribe to submissions');
    }
    this.pb
      .collection('submissions')
      .subscribe('*', async ({ action, record }) => {
        if (!['create', 'update'].includes(action)) return;
        if (record.id !== submissionId) return;
        const updated = await this.getSubmissionById(submissionId);
        if (updated) callback(updated);
      });
  }

  unregisterSubmissionUpdateCallback() {
    try {
      this.pb.collection('submissions').unsubscribe('*');
    } catch (error) {
      console.warn('Failed to unsubscribe from submissions:', error);
    }
  }

  // Chat System Methods
  async getChatRooms(): Promise<ChatRoom[]> {
    const user = this.getUser();
    if (!user) {
      throw new Error('Authentication required to access chat rooms');
    }

    // Filter by participant at the DB level so PocketBase ACL doesn't block students.
    // participants is stored as a JSON string (e.g. '["id1","id2"]'),
    // so the ~ (contains) operator works as a substring match on the stored text.
    // Sort by +created (oldest first) so the deduplication Map always keeps the
    // ORIGINAL room between two users, not the most-recently-created duplicate.
    // Duplicate rooms were created during testing; the messages live in the oldest one.
    const models = await this.pb.collection('chat_rooms').getFullList({
      filter: `isActive = true && participants ~ "${user.id}"`,
      sort: '+created',
    });

    const rooms = models.map((model) => new ChatRoom(model));

    // Client-side safety net: ensure the parsed participants array actually
    // contains the current user (guards against JSON parse edge cases).
    return rooms.filter((room) => room.participants.includes(user.id));
  }

  async getChatRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      const model = await this.pb.collection('chat_rooms').getOne(roomId, {
        expand: 'groupId,createdBy',
      });
      return new ChatRoom(model);
    } catch {
      return null;
    }
  }

  async createChatRoom(room: UnsavedChatRoom): Promise<ChatRoom | null> {
    const user = this.getUser();
    if (!user) {
      throw new Error('Authentication required to create chat rooms');
    }

    try {
      console.log('Creating chat room with participants:', {
        roomName: room.name,
        roomType: room.type,
        participants: room.participants,
        createdBy: user.id,
        userRole: user.role,
      });
      // Ensure participants is properly formatted as JSON string for PocketBase
      const roomData = {
        name: room.name,
        type: room.type,
        description: room.description || '',
        participants: JSON.stringify(room.participants), // Convert array to JSON string
        createdBy: user.id,
        isActive: true,
      };

      console.log('Room data being sent:', roomData);

      const model = await this.pb.collection('chat_rooms').create(roomData, {
        expand: 'createdBy',
      });

      console.log('Created chat room:', {
        roomId: model.id,
        participants: model.participants,
        roomName: model.name,
      });

      return new ChatRoom(model);
    } catch (error: any) {
      console.error('Failed to create chat room:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        data: error?.data,
        response: error?.response,
        url: error?.url,
        isAbort: error?.isAbort,
        isClientError: error?.isClientError,
        isServerError: error?.isServerError,
      });

      // Log the full error object to see all properties
      console.error('Full error object:', error);

      // Log the detailed error data
      if (error?.data?.data) {
        console.error('Validation errors:', error.data.data);
      }

      return null;
    }
  }

  async getChatMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const user = this.getUser();
    if (!user) {
      throw new Error('Authentication required to get chat messages');
    }

    try {
      // No expand on userId/replyTo — students may lack permission to expand
      // user relations. Display names are resolved client-side from allUsers state.
      const models = await this.pb
        .collection('chat_messages')
        .getList(1, limit, {
          filter: `roomId = "${roomId}"`,
          sort: '-created',
        });
      return models.items.map((model) => new ChatMessage(model));
    } catch (error: any) {
      console.error(
        `getChatMessages failed for room ${roomId}:`,
        error?.status,
        error?.message,
      );
      return [];
    }
  }

  async postChatMessage(
    message: UnsavedChatMessage,
  ): Promise<ChatMessage | null> {
    const user = this.getUser();
    if (!user) {
      throw new Error('Authentication required to post messages');
    }

    // Create without expand — construct ChatMessage directly from the response
    // to avoid a second getOne call that may be blocked by PocketBase view rules.
    const model = await this.pb.collection('chat_messages').create({
      ...message,
      userId: user.id,
      type: message.type || 'text',
      readBy: [user.id],
    });

    return new ChatMessage(model);
  }

  registerChatMessageCallback(
    roomId: string,
    callback: (action: string, message: ChatMessage) => void,
  ) {
    const user = this.getUser();
    if (!user) {
      throw new Error('Authentication required to subscribe to chat messages');
    }

    // Subscribe synchronously — no async getChatRoom gate.
    // Construct ChatMessage directly from the realtime record to avoid a
    // second getOne fetch that may be blocked by PocketBase view rules.
    this.pb
      .collection('chat_messages')
      .subscribe('*', ({ action, record }) => {
        // we omit `if (action !== 'create') return;` so we get updates/deletes too
        if (record.roomId !== roomId) return;

        const message = new ChatMessage(record);
        if (message.roomId === roomId) {
          callback(action, message);
        }
      })
      .catch((error) => {
        console.error('Failed to setup chat message subscription:', error);
      });
  }

  async getChatMessage(messageId: string): Promise<ChatMessage | null> {
    try {
      // No expand — avoids 403 when students lack permission to expand
      // user relations. Names are resolved from allUsers state in the UI.
      const model = await this.pb.collection('chat_messages').getOne(messageId);
      return new ChatMessage(model);
    } catch {
      return null;
    }
  }

  unregisterChatMessageCallback() {
    this.pb
      .collection('chat_messages')
      .unsubscribe('*')
      .catch((error) => {
        console.warn('Failed to unsubscribe from chat messages:', error);
      });
  }

  async getRoomOverview(roomIds: string[]): Promise<{
    unread: Record<string, number>;
    latest: Record<string, string>;
  }> {
    const user = this.getUser();
    if (!user) return { unread: {}, latest: {} };

    const unread: Record<string, number> = {};
    const latest: Record<string, string> = {};

    try {
      // 1. Unread counts
      const unreadModels = await this.pb
        .collection('chat_messages')
        .getFullList({
          filter: `userId != "${user.id}" && readBy !~ "${user.id}"`,
          fields: 'roomId',
        });
      for (const m of unreadModels) {
        unread[m.roomId] = (unread[m.roomId] || 0) + 1;
      }

      // 2. Latest message timestamps for the active sidebars
      if (roomIds.length > 0) {
        const results = await Promise.allSettled(
          roomIds.map(async (id) => {
            const res = await this.pb
              .collection('chat_messages')
              .getList(1, 1, {
                filter: `roomId = "${id}"`,
                sort: '-created',
                fields: 'roomId,created',
              });
            if (res.items.length > 0) {
              latest[id] = res.items[0].created;
            }
          }),
        );
        results.forEach((r, i) => {
          if (r.status === 'rejected') {
            console.error(
              `getRoomOverview failed for room ${roomIds[i]}:`,
              r.reason,
            );
          }
        });
      }
    } catch (error) {
      console.error('Failed to get room overview:', error);
    }

    return { unread, latest };
  }

  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    const user = this.getUser();
    if (!user || !messageIds.length) return;

    await Promise.allSettled(
      messageIds.map(async (id) => {
        try {
          const msg = await this.pb.collection('chat_messages').getOne(id);
          const readBy = msg.readBy || [];
          if (!readBy.includes(user.id)) {
            await this.pb.collection('chat_messages').update(id, {
              readBy: [...readBy, user.id],
            });
          }
        } catch (error) {
          console.error(`Failed to mark message ${id} as read:`, error);
        }
      }),
    );
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const models = await this.pb.collection('_pb_users_auth_').getFullList({
        sort: 'name',
      });
      return models.map((model) => new User(model));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
  // ── Presence / Online Status ────────────────────────────────
  /** Ping: update current user's lastSeen timestamp */
  // ── Presence feature flag ───────────────────────────────────
  // Set to true only after adding a `lastSeen` (DateTime, optional) field
  // to the `users` collection in PocketBase Admin → Collections → users.
  private static readonly PRESENCE_ENABLED = false;

  async updatePresence(): Promise<void> {
    if (!PocketbaseClient.PRESENCE_ENABLED) return;
    const user = this.getUser();
    if (!user) return;
    try {
      await this.pb.collection('users').update(user.id, {
        lastSeen: new Date().toISOString(),
      });
    } catch {
      // Silently ignore
    }
  }

  /**
   * Returns a Set of user IDs seen within the last `thresholdMs` ms.
   * Returns an empty Set when PRESENCE_ENABLED is false (no API call).
   */
  async getOnlineUserIds(thresholdMs = 90_000): Promise<Set<string>> {
    if (!PocketbaseClient.PRESENCE_ENABLED) return new Set();
    try {
      const cutoff = new Date(Date.now() - thresholdMs).toISOString();
      const models = await this.pb.collection('users').getFullList({
        filter: `lastSeen >= "${cutoff}"`,
        fields: 'id',
      });
      return new Set(models.map((m) => m.id));
    } catch {
      return new Set();
    }
  }

  /** Subscribe to user record changes for online indicator updates. */
  subscribeToPresence(callback: (userId: string) => void): void {
    if (!PocketbaseClient.PRESENCE_ENABLED) return;
    const user = this.getUser();
    if (!user) return;
    this.pb
      .collection('users')
      .subscribe('*', ({ record }) => {
        callback(record.id);
      })
      .catch(() => {
        /* ignore – presence is best-effort */
      });
  }

  unsubscribeFromPresence(): void {
    if (!PocketbaseClient.PRESENCE_ENABLED) return;
    this.pb
      .collection('users')
      .unsubscribe('*')
      .catch(() => {
        /* ignore – presence is best-effort */
      });
  }

  // ── Admin-only methods ────────────────────────────────────────────────────

  /** Returns every user on the platform (Admin role required). */
  async getAllUsersAdmin(roleFilter?: string): Promise<User[]> {
    const filter = roleFilter ? `role='${roleFilter}'` : '';
    const models = await this.pb.collection('users').getFullList({
      sort: 'name',
      filter,
    });
    return models.map((m) => new User(m));
  }

  /** Update any user's name and/or role (Admin only). */
  async updateUserAdmin(
    userId: string,
    data: { name?: string; role?: UserRole },
  ): Promise<void> {
    await this.pb.collection('users').update(userId, data);
  }

  /** Delete any user account (Admin only). */
  async deleteUserAdmin(userId: string): Promise<void> {
    await this.pb.collection('users').delete(userId);
  }

  /** Returns ALL groups across all teachers (Admin only). */
  async getAllGroupsAdmin(): Promise<Group[]> {
    const models = await this.pb.collection('groups').getFullList({
      sort: '-created',
      expand: 'teacherId',
    });
    const groups: Group[] = [];
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

  /** Returns ALL activities across all classes (Admin only). */
  async getAllActivitiesAdmin(): Promise<Activity[]> {
    const models = await this.pb.collection('activities').getFullList({
      sort: '-created',
      expand: 'groupId',
    });
    const activities: Activity[] = [];
    for (const model of models) {
      const { totalItems } = await this.pb.collection('units').getList(1, 1, {
        filter: `activityId='${model.id}'`,
      });
      activities.push(new Activity(model, totalItems));
    }
    return activities;
  }

  /** Platform-wide stats for the admin overview cards. */
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalGroups: number;
    totalActivities: number;
    totalSubmissions: number;
  }> {
    const [users, teachers, students, groups, activities, submissions] =
      await Promise.all([
        this.pb
          .collection('users')
          .getList(1, 1, {})
          .then((r) => r.totalItems),
        this.pb
          .collection('users')
          .getList(1, 1, { filter: "role='Teacher'" })
          .then((r) => r.totalItems),
        this.pb
          .collection('users')
          .getList(1, 1, { filter: "role='Student'" })
          .then((r) => r.totalItems),
        this.pb
          .collection('groups')
          .getList(1, 1, {})
          .then((r) => r.totalItems),
        this.pb
          .collection('activities')
          .getList(1, 1, {})
          .then((r) => r.totalItems),
        this.pb
          .collection('submissions')
          .getList(1, 1, {})
          .then((r) => r.totalItems),
      ]);
    return {
      totalUsers: users,
      totalTeachers: teachers,
      totalStudents: students,
      totalGroups: groups,
      totalActivities: activities,
      totalSubmissions: submissions,
    };
  }

  // Admin Group Enrollment management
  async addUserToGroupAdmin(groupId: string, userId: string): Promise<void> {
    await this.pb.collection('usergroups').create({
      groupId,
      userId,
    });
  }

  async removeUserFromGroupAdmin(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const userGroups = await this.pb.collection('usergroups').getFullList({
      filter: `groupId='${groupId}' && userId='${userId}'`,
    });
    for (const ug of userGroups) {
      await this.pb.collection('usergroups').delete(ug.id);
    }
  }

  async updateGroupTeacherAdmin(
    groupId: string,
    teacherId: string,
  ): Promise<void> {
    await this.pb.collection('groups').update(groupId, {
      teacherId,
    });
  }

  // --- Materials ---
  async getMaterials(groupId: string): Promise<Material[]> {
    const records = await this.pb.collection('materials').getFullList({
      filter: `groupId='${groupId}'`,
      sort: '-created',
    });
    return records.map((r) => new Material(r));
  }

  async addMaterial(data: UnsavedMaterial): Promise<Material> {
    const formData = new FormData();
    formData.append('groupId', data.groupId);
    formData.append('title', data.title);
    formData.append('type', data.type);

    if (data.file) {
      for (const f of data.file) {
        formData.append('file', f);
      }
    }

    const record = await this.pb.collection('materials').create(formData);
    return new Material(record);
  }

  async deleteMaterial(materialId: string): Promise<void> {
    await this.pb.collection('materials').delete(materialId);
  }

  getMaterialFileUrl(material: Material, filename: string): string {
    return this.pb.files.getUrl(material.model, filename);
  }
}
const client = new PocketbaseClient();
export default client;
