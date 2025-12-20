import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/workshop";
import { NextResponse } from "next/server";

// GET all workshops
export async function GET() {
  await connectDB();

  const workshops = await Workshop.find();
  return NextResponse.json(workshops);
}

// CREATE workshop
export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const workshop = await Workshop.create(body);
  return NextResponse.json(workshop, { status: 201 });
}
