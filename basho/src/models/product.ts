import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  weight: number;
  images: string[];
  material: string;
  care: string;
  category: mongoose.Types.ObjectId;
  stock: number;
  isPublished: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: String,
    price: Number,
    weight: Number,
    images: [String],
    material: String,
    care: String,
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    stock: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Use a simpler model registration
const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;