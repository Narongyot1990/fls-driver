import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeader extends Document {
  email: string;
  password: string;
  name: string;
  branch?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaderSchema = new Schema<ILeader>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    branch: { type: String },
  },
  { timestamps: true }
);

export const Leader: Model<ILeader> =
  mongoose.models.Leader || mongoose.model<ILeader>('Leader', LeaderSchema);
