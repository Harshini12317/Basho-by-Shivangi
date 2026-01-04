import mongoose, { Schema, Document } from "mongoose";

export interface ICustomOrder extends Document {
  name: string;
  email: string;
  phone: string;
  description: string;
  referenceImages: string[];
  notes: string;
  status: "requested" | "quoted" | "paid" | "in-progress" | "completed";
  quotedPrice?: number;
  paymentId?: string;
  razorpayOrderId?: string;
  paidAt?: Date;
}

const CustomOrderSchema = new Schema<ICustomOrder>(
  {
    name: String,
    email: String,
    phone: String,
    description: String,
    referenceImages: [String],
    notes: String,
    status: {
      type: String,
      enum: ["requested", "quoted", "paid", "in-progress", "completed"],
      default: "requested",
    },
    quotedPrice: Number,
    paymentId: String,
    razorpayOrderId: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.CustomOrder ||
  mongoose.model<ICustomOrder>("CustomOrder", CustomOrderSchema);