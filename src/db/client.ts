import Pocketbase from 'pocketbase';
import { Group, User } from './types';

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
    try {
      return (await this.pb.collection('groups').getFullList()) as Group[];
    } catch (error) {
      console.error(error);
      return Promise.resolve([]);
    }
  }

  async getStudentsCount(groupId: string): Promise<number> {
    try {
      const response = await this.pb.collection('usergroups').getList(1, 1, {
        filter: `group='${groupId}' && user.role='Student'`,
      });
      return response.totalItems;
    } catch (error) {
      console.error(error);
      return Promise.resolve(-1);
    }
  }

  async getStudents(groupId: string): Promise<User[]> {
    try {
      const userGroups = await this.pb.collection('usergroups').getFullList({
        expand: 'user',
        filter: `group='${groupId}' && user.role='Student'`,
      });
      return userGroups
        .map(({ expand }) => expand?.user)
        .filter((user) => !!user);
    } catch (error) {
      console.error(error);
      return Promise.resolve([]);
    }
  }
}

const client = new PocketbaseClient();
export default client;
