import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary config loaded:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'missing',
  api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing'
});

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('File received:', file?.name, file?.size, file?.type);

    if (!file) {
      console.log('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    console.log('File type:', file.type, 'Allowed types:', allowedTypes);
    if (!allowedTypes.includes(file.type)) {
      console.log('File type not allowed');
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WebP files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    let buffer: Buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      console.log('Buffer created, size:', buffer.length);
    } catch (error) {
      console.error('Failed to convert file to buffer:', error);
      return NextResponse.json(
        { error: 'Failed to process file' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary with optimizations
    console.log('Starting Cloudinary upload...');
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'basho-products',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Increased max size for better quality
            { quality: 'auto' }, // Auto quality optimization
            { fetch_format: 'auto' } // Auto format selection (WebP, AVIF, etc.)
          ],
          // Performance optimizations
          timeout: 60000, // 60 second timeout
          eager: [
            { width: 400, height: 400, crop: 'fill', quality: 'auto' } // Generate thumbnail
          ],
          // Upload optimizations
          use_filename: true,
          unique_filename: true,
          overwrite: false
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', (result as any).secure_url);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return NextResponse.json({
      url: (result as any).secure_url,
      public_id: (result as any).public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}