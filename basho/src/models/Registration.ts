import mongoose, { Schema, models } from "mongoose";

const RegistrationSchema = new Schema(
  {
    workshopSlug: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const Registration = models.Registration || mongoose.model("Registration", RegistrationSchema);

export default Registration;
