/**
 * File Upload API - Generate pre-signed URLs for S3 uploads
 * POST /api/upload
 *
 * Request body:
 * {
 *   "fileName": "example.png",
 *   "mimeType": "image/png",
 *   "size": 1024000
 * }
 *
 * Response:
 * {
 *   "uploadUrl": "https://bucket.s3.amazonaws.com/...",
 *   "key": "uploads/user123/uuid-example.png",
 *   "publicUrl": "https://bucket.s3.amazonaws.com/uploads/user123/uuid-example.png"
 * }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { generateUploadUrl, getPublicUrl, validateFile } from "@/lib/s3";
import { authenticate } from "@/lib/auth";
import { handleError } from "@/lib/errorHandler";

// Validation schema
const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

export async function POST(request) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = uploadRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fileName, mimeType, size } = validation.data;

    // Validate file type and size
    const fileValidation = validateFile(mimeType, size);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Generate unique file key
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split(".").pop();
    const key = `uploads/${user.id}/${timestamp}-${randomId}.${fileExtension}`;

    // Generate pre-signed upload URL (60 seconds expiry)
    const uploadUrl = await generateUploadUrl(key, mimeType, 60);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl,
      expiresIn: 60,
    });
  } catch (error) {
    return handleError(error);
  }
}
