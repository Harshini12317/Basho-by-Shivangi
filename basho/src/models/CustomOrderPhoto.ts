import mongoose, { Schema, model, models } from "mongoose";

const CustomOrderPhotoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{
      type: String,
      required: true,
    }],
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Prevent model overwrite error in Next.js
const CustomOrderPhoto = models.CustomOrderPhoto || model("CustomOrderPhoto", CustomOrderPhotoSchema);

export default CustomOrderPhoto;