import mongoose, { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
  productSlug: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingAmount: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ordered", "processing", "out for delivery", "shipped"],
      default: "ordered",
    },
    paymentId: {
      type: String,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    customer: {
      name: String,
      email: String,
      phone: String,
      gstNumber: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = models.Order || model("Order", OrderSchema);

export default Order;