import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      // ============================================
      // OPTION 1: Cloudinary Upload
      // ============================================
      //
      // import { v2 as cloudinary } from 'cloudinary';
      //
      // cloudinary.config({
      //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      //   api_key: process.env.CLOUDINARY_API_KEY,
      //   api_secret: process.env.CLOUDINARY_API_SECRET,
      // });
      //
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);
      //
      // const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      //   const uploadStream = cloudinary.uploader.upload_stream(
      //     {
      //       folder: 'surya-jewellers/products',
      //       resource_type: 'image',
      //       transformation: [
      //         { width: 1200, height: 1200, crop: 'limit', quality: 'auto', format: 'webp' },
      //       ],
      //     },
      //     (error, result) => {
      //       if (error) reject(error);
      //       else resolve(result as { secure_url: string });
      //     }
      //   );
      //   uploadStream.end(buffer);
      // });
      //
      // uploadedUrls.push(result.secure_url);

      // ============================================
      // OPTION 2: AWS S3 Upload
      // ============================================
      //
      // import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
      //
      // const s3 = new S3Client({
      //   region: process.env.AWS_REGION,
      //   credentials: {
      //     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      //   },
      // });
      //
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);
      // const key = `products/${Date.now()}-${file.name}`;
      //
      // await s3.send(new PutObjectCommand({
      //   Bucket: process.env.AWS_S3_BUCKET!,
      //   Key: key,
      //   Body: buffer,
      //   ContentType: file.type,
      // }));
      //
      // uploadedUrls.push(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`);

      // ============================================
      // Demo Mode: Return placeholder URLs
      // ============================================
      uploadedUrls.push(
        `https://placehold.co/800x800/f5f0e8/d4af37?text=${encodeURIComponent(file.name)}`
      );
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
