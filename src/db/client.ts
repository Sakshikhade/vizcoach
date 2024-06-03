import Pocketbase from 'pocketbase';
import { Group, User } from './types';

class PocketbaseClient {
  readonly pb: Pocketbase;

  constructor() {
    this.pb = new Pocketbase(process.env.REACT_APP_POCKETBASE_URL);
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
      return [];
    }
  }
}

const client = new PocketbaseClient();
export default client;
