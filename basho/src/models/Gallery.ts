import mongoose, { Schema, Document } from "mongoose";

export interface IGallery extends Document {
  title: string;
  image: string;
  category: "product" | "workshop" | "studio" | "others";
  publicId?: string; // Cloudinary public ID for deletion
}

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      enum: ["product", "workshop", "studio", "others"],
      default: "others"
    },
    publicId: String, // Cloudinary public ID
  },
  { timestamps: true }
);

// Index for ordering
GallerySchema.index({ category: 1, createdAt: -1 });

export default mongoose.models.Gallery ||
  mongoose.model<IGallery>("Gallery", GallerySchema);