import mongoose, { Schema, model, models } from "mongoose";

const StaticDataSchema = new Schema(
  {
    studioLocation: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: '' },
      googleMapsLink: { type: String, default: '' },
    },
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      socialMedia: {
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
      },
    },
    faqs: [{
      question: { type: String, default: '' },
      answer: { type: String, default: '' },
    }],
    hsnCode: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error in Next.js
const StaticData = models.StaticData || model("StaticData", StaticDataSchema);

export default StaticData;