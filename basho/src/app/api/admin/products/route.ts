export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/product';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({})
      .populate({
        path: 'category',
        model: 'Category'
      })
      .sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/admin/products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const product = new Product({
      ...body,
      slug,
    });

    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    // log full error on the server for debugging
    console.error('POST /api/admin/products error:', error);

    // handle duplicate slug/index errors from MongoDB
    // @ts-ignore
    if (error && typeof error === 'object' && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Product with same slug/title already exists' },
        { status: 409 }
      );
    }

    // try to return a helpful message if available
    // @ts-ignore
    const message = error && (error as any).message ? (error as any).message : 'Failed to create product';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}



