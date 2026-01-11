import mongoose, { Schema, model, models } from "mongoose";
import crypto from "crypto";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
    },

    verificationCodeExpires: {
      type: Date,
    },
    
    addresses: [{
      _id: { type: String, default: () => crypto.randomUUID() },
      label: { type: String, default: "Home" },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    }],
    phone: { type: String, default: "" },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Prevent model overwrite error in Next.js
const User = models.User || model("User", UserSchema);

export default User;
