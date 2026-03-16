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
  userId: string | mongoose.Types.ObjectId;
  recordType: RecordType;
  description?: string;
  date: Date;
  createdBy: string | mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubstituteRecordSchema = new Schema<ISubstituteRecord>(
  {
    userId: { type: Schema.Types.Mixed, ref: 'User', required: true },
    recordType: {
      type: String,
      enum: ['vacation', 'sick', 'personal', 'unpaid', 'absent', 'late', 'accident', 'damage'],
      required: true,
    },
    description: { type: String, trim: true, maxlength: 1000 },
    date: { type: Date, required: true },
    createdBy: { type: Schema.Types.Mixed, ref: 'User', required: true },
  },
  { timestamps: true }
);

SubstituteRecordSchema.index({ userId: 1, date: -1 });
SubstituteRecordSchema.index({ createdBy: 1, createdAt: -1 });

export const SubstituteRecord: Model<ISubstituteRecord> =
  mongoose.models.SubstituteRecord ||
  mongoose.model<ISubstituteRecord>('SubstituteRecord', SubstituteRecordSchema);
