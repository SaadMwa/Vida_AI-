import { Emitter } from '@socket.io/redis-emitter';
import { createRedisConnection } from '../config/redis';

let emitter: Emitter | null = null;

export function getEmitter(): Emitter {
  if (!emitter) {
    emitter = new Emitter(createRedisConnection());
  }
  return emitter;
}

export function emitToAssignment(assignmentId: string, event: string, data: unknown): void {
  getEmitter().to(`assignment:${assignmentId}`).emit(event, data);
}
