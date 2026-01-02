import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/product";
import Category from "@/models/Category";

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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    const search = searchParams.get('search');

    let query: any = { isPublished: true };

    // Add search filter if provided
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Add category filter if provided
    if (category && category !== 'all') {
      // Find category by name (case insensitive)
      const categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, 'i') }
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Build sort options
    let sortOptions: any = { createdAt: -1 }; // default sort by newest
    if (sort) {
      switch (sort) {
        case 'price-low':
          sortOptions = { price: 1 };
          break;
        case 'price-high':
          sortOptions = { price: -1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
      }
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortOptions);

    return NextResponse.json(products);
  } catch (err: any) {
    console.error('GET /api/products error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}