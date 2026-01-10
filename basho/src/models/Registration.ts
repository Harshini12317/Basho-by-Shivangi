import mongoose, { Schema, models } from "mongoose";

const RegistrationSchema = new Schema(
  {
    workshopSlug: { type: String },
    workshopTitle: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    members: { type: Number, default: 1 },
    requests: { type: String },
    level: { type: String },
    date: { type: String },
    timeSlot: { type: String },
    paymentId: { type: String },
    orderId: { type: String },
    amount: { type: Number },
  },
  { timestamps: true }
);

const Registration = models.Registration || mongoose.model("Registration", RegistrationSchema);

export default Registration;
