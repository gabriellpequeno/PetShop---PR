import { Database } from 'sqlite';

export interface Job {
  id: string;
  name: string;
  priceP: number;
  priceM: number;
  priceG: number;
  duration: number;
  status: string;
}

export class ListJobsService {
  constructor(private db: Database) {}

  async execute(): Promise<Job[]> {
    const jobs = await this.db.all<Job[]>('SELECT * FROM jobs');
    return jobs;
  }
}