import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis';

export const GENERATION_QUEUE = 'generation';

export const generationQueue = new Queue(GENERATION_QUEUE, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 1,
  },
});

export interface GenerationJobData {
  assignmentId: string;
  jobId: string;
  bypassCache?: boolean;
}
