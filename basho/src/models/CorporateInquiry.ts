import mongoose, { Schema, Document } from 'mongoose';

export interface ICorporateInquiry extends Document {
  companyName: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Date;
}

const CorporateInquirySchema = new Schema<ICorporateInquiry>(
  {
    companyName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.CorporateInquiry ||
  mongoose.model<ICorporateInquiry>('CorporateInquiry', CorporateInquirySchema);
