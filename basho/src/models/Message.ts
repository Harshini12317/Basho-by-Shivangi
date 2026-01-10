import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  customOrderId: mongoose.Types.ObjectId;
  senderId: string; // user email or 'admin'
  senderType: 'customer' | 'admin';
  message: string;
  timestamp: Date;
  read: boolean;
}

const MessageSchema = new Schema<IMessage>(
  {
    customOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'CustomOrder',
      required: true
    },
    senderId: {
      type: String,
      required: true
    },
    senderType: {
      type: String,
      enum: ['customer', 'admin'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for efficient querying
MessageSchema.index({ customOrderId: 1, timestamp: 1 });

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);