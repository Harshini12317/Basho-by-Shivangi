import mongoose, { Schema, Document } from "mongoose";

export interface IEventBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  bookingDate: Date;
  numberOfGuests?: number;
  specialRequests?: string;
  createdAt: Date;
  status: "pending" | "confirmed" | "cancelled";
}

const EventBookingSchema = new Schema<IEventBooking>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    bookingDate: { type: Date, required: true },
    numberOfGuests: { type: Number, default: 1 },
    specialRequests: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.models.EventBooking ||
  mongoose.model<IEventBooking>("EventBooking", EventBookingSchema);
