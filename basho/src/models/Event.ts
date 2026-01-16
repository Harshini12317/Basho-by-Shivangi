import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  date?: Date;
  endDate?: Date;
  location: string;
  locationLink?: string;
  images: string[];
  type: "workshop" | "exhibition" | "fair" | "other";
  isPublished: boolean;
  featured: boolean;
  registrationRequired: boolean;
  maxAttendees?: number;
  currentAttendees: number;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, sparse: true },
    description: { type: String, required: true },
    date: { type: Date, required: false, default: null },
    endDate: { type: Date, required: false, default: null },
    location: { type: String, required: true },
    locationLink: { type: String, required: false, default: null },
    images: [String],
    type: {
      type: String,
      enum: ["workshop", "exhibition", "fair", "other"],
      default: "other"
    },
    isPublished: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    registrationRequired: { type: Boolean, default: false },
    maxAttendees: Number,
    currentAttendees: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema);