import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  taskId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, read: 1 });

export const Notification = mongoose.model<INotificationDocument>(
  'Notification',
  notificationSchema
);
