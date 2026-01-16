import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { HomePageContent } from "@/models/HomePageContent";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    await connectDB();
    const content = await HomePageContent.findOne();
    
    if (!content) {
      return NextResponse.json({
        heroSlideshow: [],
        gsapSlider: [],
        featuresSection: [],
      });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching home page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch home page content" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { section, imageUrl, publicId, altText, title, description, order } = data;

    if (!section || !imageUrl || !publicId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    let content = await HomePageContent.findOne();

    if (!content) {
      content = new HomePageContent({
        heroSlideshow: [],
        gsapSlider: [],
        featuresSection: [],
      });
    }

    const imageData = {
      imageUrl,
      publicId,
      altText: altText || `${section} Image`,
      order: order || content[section as keyof typeof content]?.length || 0,
      isActive: true,
    };

    if (title) (imageData as any).title = title;
    if (description) (imageData as any).description = description;

    (content[section as keyof typeof content] as any).push(imageData);
    await content.save();

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error("Error adding image:", error);
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { section, imageId, updates } = data;

    if (!section || !imageId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const content = await HomePageContent.findOne();

    if (!content) {
      return NextResponse.json(
        { error: "Home page content not found" },
        { status: 404 }
      );
    }

    const sectionArray = content[section as keyof typeof content] as any;
    const index = sectionArray.findIndex((item: any) => item._id.toString() === imageId);

    if (index === -1) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Preserve critical fields and merge updates
    const originalItem = sectionArray[index];
    sectionArray[index] = { 
      ...originalItem,
      ...updates,
      imageUrl: originalItem.imageUrl, // Preserve imageUrl
      publicId: originalItem.publicId, // Preserve publicId
      _id: originalItem._id, // Preserve _id
    };
    await content.save();

    console.log("Image updated successfully:", {
      section,
      imageId,
      updates,
      updatedImage: sectionArray[index],
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");
    const imageId = searchParams.get("imageId");
    const publicId = searchParams.get("publicId");

    if (!section || !imageId || !publicId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const content = await HomePageContent.findOne();

    if (!content) {
      return NextResponse.json(
        { error: "Home page content not found" },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error("Error deleting from Cloudinary:", cloudinaryError);
    }

    const sectionArray = content[section as keyof typeof content] as any;
    const index = sectionArray.findIndex((item: any) => item._id.toString() === imageId);

    if (index === -1) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    sectionArray.splice(index, 1);
    await content.save();

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
