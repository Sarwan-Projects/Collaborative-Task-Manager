import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  previousValue?: string;
  newValue?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    previousValue: {
      type: String
    },
    newValue: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ taskId: 1 });
auditLogSchema.index({ userId: 1 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
