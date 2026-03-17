import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  userId: string;
  userName: string;
  userImage?: string;
  type: 'in' | 'out';
  branch: string;
  location: {
    lat: number;
    lon: number;
  };
  distance: number; // in meters from branch center
  isInside: boolean;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userImage: { type: String },
    type: { type: String, enum: ['in', 'out'], required: true },
    branch: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    distance: { type: Number, required: true },
    isInside: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AttendanceSchema.index({ userId: 1, timestamp: -1 });
AttendanceSchema.index({ branch: 1, timestamp: -1 });
AttendanceSchema.index({ userId: 1, type: 1, timestamp: -1 });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
