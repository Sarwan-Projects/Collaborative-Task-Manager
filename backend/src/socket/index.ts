import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';

let io: Server;

/**
 * Initialize Socket.io server
 * Sets up authentication and event handlers for real-time communication
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      socket.data.userId = decoded.id;
      socket.data.email = decoded.email;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`✅ User connected: ${socket.data.userId}`);

    // Join user-specific room for targeted notifications
    socket.join(`user:${socket.data.userId}`);

    // Handle joining task-specific rooms (for viewing task details)
    socket.on('task:join', (taskId: string) => {
      socket.join(`task:${taskId}`);
      console.log(`User ${socket.data.userId} joined task room: ${taskId}`);
    });

    // Handle leaving task rooms
    socket.on('task:leave', (taskId: string) => {
      socket.leave(`task:${taskId}`);
      console.log(`User ${socket.data.userId} left task room: ${taskId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
};

/**
 * Get the Socket.io server instance
 * Used by controllers to emit events
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
