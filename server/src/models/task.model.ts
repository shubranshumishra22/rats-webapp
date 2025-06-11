import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.model';

/**
 * Interface defining the structure of a Task document.
 * This includes the owner, collaborators, and all pending invitations.
 */
export interface ITask extends Document {
  owner: IUser['_id'];
  collaborators: IUser['_id'][];
  pendingInvitations: IUser['_id'][];
  content: string;
  isCompleted: boolean;
  visibility: 'private' | 'public';
}

const TaskSchema: Schema = new Schema(
  {
    // The user who created and owns the task.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // An array of user IDs who have accepted an invitation to collaborate.
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // An array of user IDs who have been invited but have not yet accepted.
    pendingInvitations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // The main content or description of the task.
    content: {
      type: String,
      required: true,
      trim: true
    },
    // The completion status of the task.
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    // The visibility setting, determining if the task is public or private.
    visibility: {
      type: String,
      required: true,
      enum: ['private', 'public'],
      default: 'private',
    },
  },
  {
    // Automatically manage `createdAt` and `updatedAt` timestamps.
    timestamps: true
  }
);

export default mongoose.model<ITask>('Task', TaskSchema);