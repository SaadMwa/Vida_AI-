import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis';

export const GENERATION_QUEUE = 'generation';

export const generationQueue = new Queue(GENERATION_QUEUE, {
  connection: createRedisConnection(),
});