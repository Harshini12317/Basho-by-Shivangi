import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/workshop";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  await connectDB();

  const workshop = await Workshop.findOne({ slug: params.slug });
  if (!workshop) {
    return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
  }

  return NextResponse.json(workshop);
}