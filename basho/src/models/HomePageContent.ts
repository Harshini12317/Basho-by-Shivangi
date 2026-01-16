import mongoose, { Schema, model, models } from "mongoose";

const HomePageContentSchema = new Schema(
  {
    heroSlideshow: [
      {
        imageUrl: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: { type: String, default: "Hero Slideshow Image" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    gsapSlider: [
      {
        imageUrl: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: { type: String, default: "GSAP Slider Image" },
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    featuresSection: [
      {
        imageUrl: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: { type: String, default: "Feature Image" },
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const HomePageContent =
  models.HomePageContent || model("HomePageContent", HomePageContentSchema);
