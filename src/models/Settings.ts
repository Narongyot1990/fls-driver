import mongoose, { Document, Model, Schema } from "mongoose";

export interface BranchLocation {
  lat: number;
  lon: number;
}

export interface BranchSetting {
  code: string;
  name: string;
  description?: string;
  location?: BranchLocation | null;
  radius: number;
  active: boolean;
}

export interface ISettings extends Document {
  branches: BranchSetting[];
  createdAt: Date;
  updatedAt: Date;
}

const BranchLocationSchema = new Schema<BranchLocation>(
  {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  { _id: false },
);

const BranchSettingSchema = new Schema<BranchSetting>(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    location: { type: BranchLocationSchema, default: null },
    radius: { type: Number, default: 50, min: 1, max: 5000 },
    active: { type: Boolean, default: true },
  },
  { _id: false },
);

const SettingsSchema = new Schema<ISettings>(
  {
    branches: { type: [BranchSettingSchema], default: [] },
  },
  { timestamps: true, collection: "settings" },
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
