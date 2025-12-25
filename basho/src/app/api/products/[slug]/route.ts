import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/product";

const dummyProducts = [
  {
    _id: "1",
    title: "Ceramic Dinner Plate",
    slug: "ceramic-dinner-plate",
    description: "A beautiful handcrafted ceramic dinner plate perfect for everyday use.",
    price: 1200,
    weight: 0.5,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&crop=center"
    ],
    material: "Ceramic",
    care: "Hand wash only, avoid microwave",
    category: "ready-made",
    stock: 10,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    title: "Custom Pottery Mug",
    slug: "custom-pottery-mug",
    description: "Custom-made pottery mug, designed to your specifications.",
    price: 800,
    weight: 0.3,
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center"
    ],
    material: "Clay",
    care: "Dishwasher safe, but hand wash recommended",
    category: "custom-gallery",
    stock: 5,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    title: "Stoneware Bowl Set",
    slug: "stoneware-bowl-set",
    description: "Set of 4 stoneware bowls for soups and salads.",
    price: 2500,
    weight: 1.2,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop&crop=center"
    ],
    material: "Stoneware",
    care: "Oven safe up to 200°C",
    category: "ready-made",
    stock: 8,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const product = await Product.findOne({ slug, isPublished: true });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err: any) {
    console.error('GET /api/products/[slug] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}