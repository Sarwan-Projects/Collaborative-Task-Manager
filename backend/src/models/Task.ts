import mongoose, { Schema, Document } from 'mongoose';
import { Priority, Status } from '../types';

export interface ITaskDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  status: Status;
  creatorId: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.TODO
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
taskSchema.index({ creatorId: 1 });
taskSchema.index({ assignedToId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);
