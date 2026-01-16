import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import { HomePageContent } from "@/models/HomePageContent";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const section = formData.get("section") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    if (!file || !section) {
      return NextResponse.json(
        { error: "File and section are required" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "basho/homepage",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    const uploadedImage = result as any;

    // Save to database
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
      imageUrl: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
      altText: `${section} slot ${order}`,
      title: section === "featuresSection" ? `Feature ${order + 1}` : "",
      description: section === "featuresSection" ? "" : undefined,
      order: order,
      isActive: true,
    };

    // Check if image already exists at this slot and replace it
    const sectionArray = content[section as keyof typeof content] as any;
    const existingIndex = sectionArray.findIndex((img: any) => img.order === order);

    if (existingIndex !== -1) {
      // Delete old image from Cloudinary
      try {
        await cloudinary.uploader.destroy(sectionArray[existingIndex].publicId);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
      // Replace old image
      sectionArray[existingIndex] = imageData;
    } else {
      // Add new image
      sectionArray.push(imageData);
    }

    await content.save();

    return NextResponse.json(
      {
        message: "Image uploaded successfully",
        image: uploadedImage,
        content: content,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
