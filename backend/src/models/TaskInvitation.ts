import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskInvitationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const taskInvitationSchema = new Schema<ITaskInvitationDocument>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
taskInvitationSchema.index({ toUserId: 1, status: 1 });
taskInvitationSchema.index({ taskId: 1 });

export const TaskInvitation = mongoose.model<ITaskInvitationDocument>('TaskInvitation', taskInvitationSchema);
