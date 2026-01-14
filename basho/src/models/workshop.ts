import mongoose, { Schema, models } from "mongoose";

const WorkshopSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      enum: ['None', 'Beginner', 'Intermediate', 'Advanced'],
      default: 'None',
    },

    location: {
      type: String,
      required: true,
    },

    googleMapLink: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    whatYouWillLearn: {
      type: String,
      required: true,
    },

    includes: {
      type: String,
      required: true,
    },

    moreInfo: {
      type: String,
      required: true,
    },

    image: {
      type: String, // Cloudinary URL
      required: true,
    },

    images: [
      {
        type: String, // multiple Cloudinary URLs
      },
    ],

    seats: {
      type: Number,
      default: 20,
    },
  },
  { timestamps: true }
);

const Workshop =
  models.Workshop || mongoose.model("Workshop", WorkshopSchema);

export default Workshop;
