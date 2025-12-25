import mongoose, { Schema, Document } from "mongoose";

export interface IGallery extends Document {
  title: string;
  description?: string;
  image: string;
  category: "pottery" | "workshops" | "studio" | "events" | "other";
  tags: string[];
  isPublished: boolean;
  featured: boolean;
  order: number;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true },
    description: String,
    image: { type: String, required: true },
    category: {
      type: String,
      enum: ["pottery", "workshops", "studio", "events", "other"],
      default: "other"
    },
    tags: [String],
    isPublished: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for ordering
GallerySchema.index({ order: 1, category: 1 });

export default mongoose.models.Gallery ||
  mongoose.model<IGallery>("Gallery", GallerySchema);