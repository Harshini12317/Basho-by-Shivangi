import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (err: any) {
    console.error('GET /api/categories error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}