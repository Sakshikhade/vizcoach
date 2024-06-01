import Pocketbase from 'pocketbase';
import { StudentGroup } from './types';

class PocketbaseClient {
  readonly client: Pocketbase;

  constructor() {
    this.client = new Pocketbase(process.env.REACT_APP_POCKETBASE_URL);
  }

  async getStudentGroups(): Promise<StudentGroup[]> {
    return (await this.client
      .collection('student_groups')
      .getFullList()) as StudentGroup[];
  }
}

const client = new PocketbaseClient();
export default client;
