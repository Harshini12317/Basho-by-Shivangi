import mongoose, { Schema, Document } from "mongoose";

export interface IUserReview extends Document {
  name: string;
  email: string;
  message: string;
  rating: number;
  image?: string;
  videoUrl?: string;
  testimonialType: 'text' | 'video';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

const UserReviewSchema = new Schema<IUserReview>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    image: String,
    videoUrl: String,
    testimonialType: { type: String, enum: ['text', 'video'], default: 'text' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    reviewedBy: String,
  },
  { timestamps: true }
);

export default mongoose.models.UserReview ||
  mongoose.model<IUserReview>("UserReview", UserReviewSchema);