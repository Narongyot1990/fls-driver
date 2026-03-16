import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment {
  _id?: string;
  userId: string | mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ICarWashActivity extends Document {
  userId: string | mongoose.Types.ObjectId;
  activityType: string;
  imageUrls: string[];
  caption: string;
  activityDate: Date;
  activityTime: string;
  likes: Array<string | mongoose.Types.ObjectId>;
  comments: IComment[];
  marked: boolean;
  markedBy?: string | mongoose.Types.ObjectId;
  markedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.Mixed, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CarWashActivitySchema = new Schema<ICarWashActivity>(
  {
    userId: { type: Schema.Types.Mixed, ref: 'User', required: true },
    activityType: { type: String, default: 'car-wash', trim: true, maxlength: 50 },
    imageUrls: [{ type: String, required: true }],
    caption: { type: String, default: '', trim: true, maxlength: 2000 },
    activityDate: { type: Date, required: true },
    activityTime: { type: String, required: true, trim: true },
    likes: [{ type: Schema.Types.Mixed, ref: 'User' }],
    comments: [CommentSchema],
    marked: { type: Boolean, default: false },
    markedBy: { type: Schema.Types.Mixed, ref: 'User' },
    markedAt: { type: Date },
  },
  { timestamps: true }
);

CarWashActivitySchema.index({ userId: 1, activityDate: -1 });
CarWashActivitySchema.index({ createdAt: -1 });
CarWashActivitySchema.index({ marked: 1, createdAt: -1 });
CarWashActivitySchema.index({ activityType: 1, createdAt: -1 });
CarWashActivitySchema.index({ activityDate: -1, createdAt: -1 });

export const CarWashActivity: Model<ICarWashActivity> =
  mongoose.models.CarWashActivity || mongoose.model<ICarWashActivity>('CarWashActivity', CarWashActivitySchema);
