import mongoose, { Schema, Document, Model } from 'mongoose';

export type RecordType =
  | 'vacation'
  | 'sick'
  | 'personal'
  | 'unpaid'
  | 'absent'
  | 'late'
  | 'accident'
  | 'damage';

export interface ISubstituteRecord extends Document {
  userId: mongoose.Types.ObjectId;
  recordType: RecordType;
  description?: string;
  date: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubstituteRecordSchema = new Schema<ISubstituteRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordType: {
      type: String,
      enum: ['vacation', 'sick', 'personal', 'unpaid', 'absent', 'late', 'accident', 'damage'],
      required: true,
    },
    description: { type: String },
    date: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Leader', required: true },
  },
  { timestamps: true }
);

export const SubstituteRecord: Model<ISubstituteRecord> =
  mongoose.models.SubstituteRecord ||
  mongoose.model<ISubstituteRecord>('SubstituteRecord', SubstituteRecordSchema);
