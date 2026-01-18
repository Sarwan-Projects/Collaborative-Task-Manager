import { Router } from 'express';
import { taskInvitationController } from '../controllers/taskInvitation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) =>
  taskInvitationController.getInvitations(req, res, next)
);

router.post('/:id/accept', (req, res, next) =>
  taskInvitationController.acceptInvitation(req, res, next)
);

router.post('/:id/reject', (req, res, next) =>
  taskInvitationController.rejectInvitation(req, res, next)
);

export default router;
