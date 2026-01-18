import { Response, NextFunction } from 'express';
import { taskInvitationService } from '../services/taskInvitation.service';
import { AuthRequest } from '../types';

export class TaskInvitationController {
  async getInvitations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitations = await taskInvitationService.getUserInvitations(req.user!.id);

      res.status(200).json({
        success: true,
        data: invitations
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitation = await taskInvitationService.acceptInvitation(
        req.params.id,
        req.user!.id
      );

      res.status(200).json({
        success: true,
        data: invitation,
        message: 'Task invitation accepted'
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectInvitation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitation = await taskInvitationService.rejectInvitation(
        req.params.id,
        req.user!.id
      );

      res.status(200).json({
        success: true,
        data: invitation,
        message: 'Task invitation rejected'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taskInvitationController = new TaskInvitationController();
