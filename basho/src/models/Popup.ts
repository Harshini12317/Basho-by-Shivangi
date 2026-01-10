import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPopup extends Document {
  name: string;
  isActive: boolean;
  pages: string[];
  targetSlug?: string;
  image?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  triggerType: 'page_load' | 'delay' | 'scroll';
  triggerDelayMs?: number;
  frequency: 'once_per_session' | 'once_per_day' | 'always';
  startAt?: Date;
  endAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PopupSchema = new Schema<IPopup>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    pages: [{ type: String }],
    targetSlug: { type: String },
    image: { type: String },
    title: { type: String },
    description: { type: String },
    ctaText: { type: String },
    ctaLink: { type: String },
    triggerType: {
      type: String,
      enum: ['page_load', 'delay', 'scroll'],
      default: 'page_load',
    },
    triggerDelayMs: { type: Number, default: 0 },
    frequency: {
      type: String,
      enum: ['once_per_session', 'once_per_day', 'always'],
      default: 'once_per_session',
    },
    startAt: { type: Date },
    endAt: { type: Date },
  },
  { timestamps: true }
);

const Popup: Model<IPopup> =
  mongoose.models.Popup || mongoose.model<IPopup>('Popup', PopupSchema);

export default Popup;
