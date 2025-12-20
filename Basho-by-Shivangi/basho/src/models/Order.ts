import mongoose, { Schema, Document } from "mongoose";

interface IOrderProduct {
  productId: string;
  qty: number;
  price: number;
  weight: number;
}

export interface IOrder extends Document {
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    gstNumber?: string;
  };
  products: IOrderProduct[];
  subtotal: number;
  gstAmount: number;
  shippingAmount: number;
  totalAmount: number;
  status: "created" | "paid" | "shipped" | "delivered" | "cancelled";
  paymentId?: string;
  signature?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: String,
    customer: {
      name: String,
      email: String,
      phone: String,
      gstNumber: String,
    },
    products: [
      {
        productId: String,
        qty: Number,
        price: Number,
        weight: Number,
      },
    ],
    subtotal: Number,
    gstAmount: Number,
    shippingAmount: Number,
    totalAmount: Number,
    status: {
      type: String,
      enum: ["created", "paid", "shipped", "delivered", "cancelled"],
      default: "created",
    },
    paymentId: String,
    signature: String,
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
