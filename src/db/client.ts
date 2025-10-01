import Pocketbase from 'pocketbase';
import { GridColDef } from '@mui/x-data-grid';
import { autoType, csv } from 'd3';
import {
  Activity,
  ChatMessage,
  ChatRoom,
  GroupChat,
  Comment,
  Dataset,
  DatasetRow,
  Group,
  Submission,
  Unit,
  UnsavedActivity,
  UnsavedChatMessage,
  UnsavedChatRoom,
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

  async getGroupMembers(groupId: string): Promise<User[]> {
    const user = this.getUser();
    if (!user) return [];

    // Check if user is a member of this group (for students) or if user is a teacher
    const userGroup = await this.pb.collection('usergroups').getFirstListItem(
      `groupId='${groupId}' && userId='${user.id}'`
    ).catch(() => null);

    // If user is not in the group and not a teacher, return empty array
    if (!userGroup && user.role !== 'Teacher') return [];

    const userGroups = await this.pb.collection('usergroups').getFullList({
      expand: 'userId',
      filter: `groupId='${groupId}'`,
    });
    return userGroups
      .map(({ expand }) => expand?.userId)
      .filter((user) => !!user);
  }

  async getUserGroups(): Promise<Group[]> {
    const user = this.getUser();
    if (!user) return [];

    if (user.role === 'Teacher') {
      // Teachers can see all groups
      return this.getGroups();
    } else {
      // Students can only see groups they belong to
      const userGroups = await this.pb.collection('usergroups').getFullList({
        expand: 'groupId',
        filter: `userId='${user.id}'`,
      });
      return userGroups
        .map(({ expand }) => expand?.groupId)
        .filter((group) => !!group);
    }
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
      await this.pb.collection('units').update(unit.id, {
        title: unit.title,
        description: unit.description,
        datasets: unit.datasets,
      });
      return this.getUnit(unit.activityId, unit.id);
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

  // Chat System Methods
  async getChatRooms(): Promise<ChatRoom[]> {
    const user = this.getUser();
    if (!user) {
      throw new Error('Authentication required to access chat rooms');
    }

    const models = await this.pb.collection('chat_rooms').getFullList({
      filter: `isActive = true`,
      sort: '-updated',
      expand: 'groupId,createdBy',
    });

    return models.map((model) => new ChatRoom(model));
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
        groupId: room.groupId,
        userRole: user.role
      });
      
      // For group chats, verify the group exists
      if (room.type === 'group' && room.groupId) {
        try {
          console.log('Validating group existence for ID:', room.groupId);
          const group = await this.getGroup(room.groupId);
          console.log('Group validation result:', group);
          
          if (!group) {
            console.log('Group not found, throwing error');
            throw new Error(`Group with ID ${room.groupId} not found. Please create groups first by going to the Groups page.`);
          }
          
          console.log('Group validation passed:', group.title);
        } catch (groupError: any) {
          console.error('Group validation failed:', groupError);
          // Re-throw the error to prevent the chat room creation
          throw new Error(`Cannot create group chat: No groups found. Please create groups first by going to the Groups page.`);
        }
      }
      
      // Ensure participants is properly formatted as JSON string for PocketBase
      const roomData = {
        name: room.name,
        type: room.type,
        description: room.description || '',
        groupId: room.groupId || null,
        participants: JSON.stringify(room.participants), // Convert array to JSON string
        createdBy: user.id,
        isActive: true,
      };
      
      console.log('Room data being sent:', roomData);
      
      const model = await this.pb.collection('chat_rooms').create(roomData, {
        expand: 'groupId,createdBy',
      });
      
      console.log('Created chat room:', {
        roomId: model.id,
        participants: model.participants,
        roomName: model.name
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
        isServerError: error?.isServerError
      });
      
      // Log the full error object to see all properties
      console.error('Full error object:', error);
      
      // Log the detailed error data
      if (error?.data?.data) {
        console.error('Validation errors:', error.data.data);
        // Log specific groupId error if it exists
        if (error.data.data.groupId) {
          console.error('GroupId validation error:', error.data.data.groupId);
        }
      }
      
      return null;
    }
  }

    // GroupChat methods - using existing chat_rooms collection
    async createGroupChat(groupId: string, name: string, description: string, participants: string[]): Promise<GroupChat | null> {
      const user = this.getUser();
      if (!user) {
        throw new Error('Authentication required to create group chats');
      }

      try {
        // Skip group validation for now due to access rule issues
        // TODO: Re-enable group validation once access rules are fixed
        // const group = await this.getGroup(groupId);
        // if (!group) {
        //   throw new Error(`Group with ID ${groupId} not found. Please create groups first by going to the Groups page.`);
        // }

        const groupChatData = {
          name: name,
          type: 'group',
          description: description,
          groupId: groupId,
          participants: JSON.stringify(participants),
          createdBy: user.id,
          isActive: true,
        };

        const model = await this.pb.collection('chat_rooms').create(groupChatData, {
          expand: 'groupId,createdBy',
        });

        return new GroupChat(model);
      } catch (error: any) {
        console.error('Failed to create group chat:', error);
        return null;
      }
    }

    async getGroupChats(): Promise<GroupChat[]> {
      const user = this.getUser();
      if (!user) return [];

      try {
        const models = await this.pb.collection('chat_rooms').getFullList({
          sort: '-created',
          filter: "type = 'group'",
          expand: 'groupId,createdBy',
        });

        return models.map(model => new GroupChat(model));
      } catch (error: any) {
        console.error('Failed to get group chats:', error);
        return [];
      }
    }

    async getGroupChat(groupChatId: string): Promise<GroupChat | null> {
      const user = this.getUser();
      if (!user) return null;

      try {
        const model = await this.pb.collection('chat_rooms').getOne(groupChatId, {
          expand: 'groupId,createdBy',
        });

        return new GroupChat(model);
      } catch (error: any) {
        console.error('Failed to get group chat:', error);
        return null;
      }
    }

  async getChatMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const user = this.getUser();
    if (!user) {
      throw new Error('Authentication required to get chat messages');
    }

    // First get the chat room to check if user is a participant
    const room = await this.getChatRoom(roomId);
    if (!room) {
      throw new Error('Chat room not found');
    }

    // Check if user is a participant in the room
    if (!room.participants.includes(user.id)) {
      console.log('User not participant in room (getChatMessages):', {
        userId: user.id,
        userRole: user.role,
        roomId: roomId,
        roomType: room.type,
        roomParticipants: room.participants,
        roomName: room.name,
        roomGroupId: room.groupId
      });
      throw new Error('User is not a participant in this chat room');
    }

    const models = await this.pb.collection('chat_messages').getList(1, limit, {
      filter: `roomId = "${roomId}"`,
      sort: '-created',
      expand: 'userId,replyTo',
    });

    return models.items.map((model) => new ChatMessage(model));
  }

  async postChatMessage(message: UnsavedChatMessage): Promise<ChatMessage | null> {
    const user = this.getUser();
    if (!user) {
      throw new Error('Authentication required to post messages');
    }

    // First get the chat room to check if user is a participant
    const room = await this.getChatRoom(message.roomId);
    if (!room) {
      throw new Error('Chat room not found');
    }

    // Check if user is a participant in the room
    if (!room.participants.includes(user.id)) {
      console.log('User not participant in room (postChatMessage):', {
        userId: user.id,
        userRole: user.role,
        roomId: message.roomId,
        roomType: room.type,
        roomParticipants: room.participants,
        roomName: room.name,
        roomGroupId: room.groupId
      });
      throw new Error('User is not a participant in this chat room');
    }

    try {
      const model = await this.pb.collection('chat_messages').create({
        ...message,
        userId: user.id,
        type: message.type || 'text',
      }, {
        expand: 'userId,replyTo',
      });
      return new ChatMessage(model);
    } catch {
      return null;
    }
  }

  registerChatMessageCallback(
    roomId: string,
    callback: (message: ChatMessage) => void,
  ) {
    const user = this.getUser();
    if (!user) {
      throw new Error('Authentication required to subscribe to chat messages');
    }

      // First get the chat room to check if user is a participant
      this.getChatRoom(roomId).then(room => {
        if (!room) {
          throw new Error('Chat room not found');
        }

        // Check if user is a participant in the room
        if (!room.participants.includes(user.id)) {
          console.log('User not participant in room (registerChatMessageCallback):', {
            userId: user.id,
            roomId: roomId,
            roomParticipants: room.participants,
            roomName: room.name
          });
          throw new Error('User is not a participant in this chat room');
        }

      this.pb
        .collection('chat_messages')
        .subscribe('*', async ({ action, record }) => {
          if (action !== 'create') {
            return;
          }

          // Strict filtering - only process messages for the specific room
          if (record.roomId !== roomId) {
            return;
          }

          const message = await this.getChatMessage(record.id);
          if (message && message.roomId === roomId) {
            callback(message);
          }
        });
    }).catch(error => {
      console.error('Failed to setup chat message subscription:', error);
    });
  }

  async getChatMessage(messageId: string): Promise<ChatMessage | null> {
    try {
      const model = await this.pb.collection('chat_messages').getOne(messageId, {
        expand: 'userId,replyTo',
      });
      return new ChatMessage(model);
    } catch {
      return null;
    }
  }

  unregisterChatMessageCallback() {
    this.pb.collection('chat_messages').unsubscribe('*');
  }

  async getAllUsers(): Promise<User[]> {
    try {
      console.log('=== GET ALL USERS DEBUG ===');
      console.log('Current user:', this.getUser());
      
      const models = await this.pb.collection('_pb_users_auth_').getFullList({
        sort: 'name',
      });
      console.log('Raw user models from PocketBase:', models.map(m => ({ id: m.id, name: m.name, role: m.role, email: m.email })));
      
      const users = models.map((model) => new User(model));
      console.log('Processed users:', users.map(u => ({ id: u.id, name: u.name, role: u.role, email: u.email })));
      console.log('=== END GET ALL USERS DEBUG ===');
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
}

const client = new PocketbaseClient();
export default client;
