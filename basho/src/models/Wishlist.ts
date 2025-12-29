import mongoose, { Schema, model, models } from "mongoose";

const WishlistItemSchema = new Schema({
  productSlug: {
    type: String,
    required: true,
  },
  productTitle: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const WishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [WishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

const Wishlist = models.Wishlist || model("Wishlist", WishlistSchema);

export default Wishlist;