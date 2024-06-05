import Pocketbase from 'pocketbase';
import { GetStudentsResponse, Group, User } from '.';

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
    if (!this.pb.authStore.isValid) return null;
    return {
      ...this.pb.authStore.model,
      token: this.pb.authStore.token,
    } as User;
  }

  async getGroups(): Promise<Group[]> {
    const groups = (await this.pb
      .collection('groups')
      .getFullList()) as Group[];
    for (const group of groups) {
      group.title = this.getGroupTitle(group);
      group.studentsCount = await this.getStudentsCount(group.id);
    }
    return groups;
  }

  async getStudentsCount(groupId: string): Promise<number> {
    const response = await this.pb.collection('usergroups').getList(1, 1, {
      filter: `group='${groupId}' && user.role='Student'`,
    });
    return response.totalItems;
  }

  async getStudents(groupId: string): Promise<GetStudentsResponse> {
    const userGroups = await this.pb.collection('usergroups').getFullList({
      expand: 'user,group',
      filter: `group='${groupId}' && user.role='Student'`,
    });

    // Extracting user from the expanded collection
    const students = userGroups
      .map(({ expand }) => expand?.user)
      .filter((user) => !!user);

    // Getting group from either the expanded collection or fetching new one
    const group: Group = userGroups.length
      ? userGroups[0].expand?.group
      : await this.pb.collection('groups').getOne(groupId);
    group.title = this.getGroupTitle(group);
    group.studentsCount = students.length;

    return {
      group,
      students,
    };
  }

  private getGroupTitle({ course, semester, year }: Group): string {
    return `${course}-${semester}-${year}`;
  }
}

const client = new PocketbaseClient();
export default client;
