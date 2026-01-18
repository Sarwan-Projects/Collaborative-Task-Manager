import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import notificationRoutes from './notification.routes';
import taskInvitationRoutes from './taskInvitation.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/invitations', taskInvitationRoutes);

export default router;
