import { Schema, model, models, type Document } from "mongoose";

export interface CustomOrderPhotoDocument extends Document {
  title: string;
  description: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomOrderPhotoSchema = new Schema<CustomOrderPhotoDocument>(
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
    images: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error in Next.js
const CustomOrderPhoto =
  models.CustomOrderPhoto ||
  model<CustomOrderPhotoDocument>(
    "CustomOrderPhoto",
    CustomOrderPhotoSchema
  );

export default CustomOrderPhoto;
