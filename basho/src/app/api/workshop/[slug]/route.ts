import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/workshop";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await connectDB();

  const workshop = await Workshop.findOne({ slug });
  if (!workshop) {
    return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
  }

  return NextResponse.json(workshop);
}