import { taskInvitationRepository } from '../repositories/taskInvitation.repository';
import { taskRepository } from '../repositories/task.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../middleware/error.middleware';

export class TaskInvitationService {
  async getUserInvitations(userId: string) {
    return taskInvitationRepository.findByUser(userId);
  }

  async acceptInvitation(invitationId: string, userId: string) {
    const invitation = await taskInvitationRepository.findById(invitationId);
    
    if (!invitation) {
      throw new ApiError('Invitation not found', 404);
    }

    // Handle both populated and non-populated toUserId
    const toUserIdString = typeof invitation.toUserId === 'string'
      ? invitation.toUserId
      : invitation.toUserId._id.toString();

    if (toUserIdString !== userId) {
      throw new ApiError('Not authorized to accept this invitation', 403);
    }

    if (invitation.status !== 'pending') {
      throw new ApiError('Invitation already processed', 400);
    }

    // Update invitation status
    await taskInvitationRepository.updateStatus(invitationId, 'accepted');

    // Get task details for notification
    const taskIdString = typeof invitation.taskId === 'string'
      ? invitation.taskId
      : invitation.taskId._id.toString();

    // Assign task to user
    await taskRepository.update(taskIdString, {
      assignedToId: userId
    });

    // Notify creator
    const user = await userRepository.findById(userId);
    const fromUserIdString = typeof invitation.fromUserId === 'string'
      ? invitation.fromUserId
      : invitation.fromUserId._id.toString();

    await notificationRepository.create({
      userId: fromUserIdString,
      message: `✅ ${user?.name} accepted your task assignment: "${(invitation.taskId as any).title}"`,
      taskId: taskIdString
    });

    return invitation;
  }

  async rejectInvitation(invitationId: string, userId: string) {
    const invitation = await taskInvitationRepository.findById(invitationId);
    
    if (!invitation) {
      throw new ApiError('Invitation not found', 404);
    }

    // Handle both populated and non-populated toUserId
    const toUserIdString = typeof invitation.toUserId === 'string'
      ? invitation.toUserId
      : invitation.toUserId._id.toString();

    if (toUserIdString !== userId) {
      throw new ApiError('Not authorized to reject this invitation', 403);
    }

    if (invitation.status !== 'pending') {
      throw new ApiError('Invitation already processed', 400);
    }

    // Update invitation status
    await taskInvitationRepository.updateStatus(invitationId, 'rejected');

    // Get task details for notification
    const taskIdString = typeof invitation.taskId === 'string'
      ? invitation.taskId
      : invitation.taskId._id.toString();

    // Notify creator
    const user = await userRepository.findById(userId);
    const fromUserIdString = typeof invitation.fromUserId === 'string'
      ? invitation.fromUserId
      : invitation.fromUserId._id.toString();

    await notificationRepository.create({
      userId: fromUserIdString,
      message: `❌ ${user?.name} declined your task assignment: "${(invitation.taskId as any).title}"`,
      taskId: taskIdString
    });

    return invitation;
  }
}

export const taskInvitationService = new TaskInvitationService();
