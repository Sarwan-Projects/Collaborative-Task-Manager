import { TaskInvitation, ITaskInvitationDocument } from '../models/TaskInvitation';

export class TaskInvitationRepository {
  async create(data: {
    taskId: string;
    fromUserId: string;
    toUserId: string;
  }): Promise<ITaskInvitationDocument> {
    const invitation = new TaskInvitation(data);
    return invitation.save();
  }

  async findById(id: string): Promise<ITaskInvitationDocument | null> {
    return TaskInvitation.findById(id)
      .populate('taskId', 'title description')
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');
  }

  async findByUser(userId: string): Promise<ITaskInvitationDocument[]> {
    return TaskInvitation.find({ toUserId: userId, status: 'pending' })
      .populate('taskId', 'title description dueDate priority')
      .populate('fromUserId', 'name email')
      .sort({ createdAt: -1 });
  }

  async findByTask(taskId: string): Promise<ITaskInvitationDocument | null> {
    return TaskInvitation.findOne({ taskId, status: 'pending' });
  }

  async updateStatus(
    id: string,
    status: 'accepted' | 'rejected'
  ): Promise<ITaskInvitationDocument | null> {
    return TaskInvitation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('taskId', 'title')
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');
  }

  async deleteByTask(taskId: string): Promise<void> {
    await TaskInvitation.deleteMany({ taskId });
  }
}

export const taskInvitationRepository = new TaskInvitationRepository();
