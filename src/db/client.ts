import Pocketbase from 'pocketbase';
import { StudentGroup, User } from './types';

class PocketbaseClient {
  readonly client: Pocketbase;

  constructor() {
    this.client = new Pocketbase(process.env.REACT_APP_POCKETBASE_URL);
  }

  getUser(): User | null {
    if (!this.client.authStore.isValid) return null;
    return {
      ...this.client.authStore.model,
      token: this.client.authStore.token,
    } as User;
  }

  async getStudentGroups(): Promise<StudentGroup[]> {
    return (await this.client
      .collection('groups')
      .getFullList()) as StudentGroup[];
  }
}

const client = new PocketbaseClient();
export default client;
