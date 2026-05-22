import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createRedisConnection } from '../config/redis';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  const pubClient = createRedisConnection();
  const subClient = pubClient.duplicate();

  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    socket.on('join', ({ assignmentId }: { assignmentId: string }) => {
      socket.join(`assignment:${assignmentId}`);
      console.log(`Socket ${socket.id} joined assignment:${assignmentId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function emitToAssignment(assignmentId: string, event: string, data: unknown): void {
  getIO().to(`assignment:${assignmentId}`).emit(event, data);
}
