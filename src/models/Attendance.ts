import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  type: 'in' | 'out';
  branch: string;
  location: {
    lat: number;
    lon: number;
  };
  distance: number; // in meters from branch center
  isInside: boolean;
  timestamp: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Leader', required: true },
    userName: { type: String, required: true },
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

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
