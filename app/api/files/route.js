/**
 * Files API - Manage file metadata in database
 * POST /api/files - Store file metadata after successful upload
 * GET /api/files - List user's uploaded files
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";
import { handleError } from "@/lib/errorHandler";
import { getCache, setCache, deleteCache } from "@/lib/redis";

// Validation schema for file metadata
const fileMetadataSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  key: z.string().min(1),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
});

// POST /api/files - Store file metadata
export async function POST(request) {
  try {
    // Authenticate user
    const { user, errorResponse } = authenticateRequest(request);
    if (errorResponse) {
      return errorResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = fileMetadataSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, url, key, size, mimeType } = validation.data;

    // Store file metadata in database
    const file = await prisma.file.create({
      data: {
        name,
        url,
        key,
        size,
        mimeType,
        uploadedById: user.id,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Invalidate cache for user's files
    await deleteCache(`files:user:${user.id}`);

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/files - List user's files with pagination
export async function GET(request) {
  try {
    // Authenticate user
    const { user, errorResponse } = authenticateRequest(request);
    if (errorResponse) {
      return errorResponse;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Try to get from cache
    const cacheKey = `files:user:${user.id}:page:${page}:limit:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch files from database
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { uploadedById: user.id },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.file.count({ where: { uploadedById: user.id } }),
    ]);

    const response = {
      files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the response (60 seconds)
    await setCache(cacheKey, response, 60);

    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/files/:id - Delete file metadata (file remains in S3)
export async function DELETE(request) {
  try {
    // Authenticate user
    const { user, errorResponse } = authenticateRequest(request);
    if (errorResponse) {
      return errorResponse;
    }

    // Get file ID from URL
    const url = new URL(request.url);
    const fileId = url.searchParams.get("id");

    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    // Check if file exists and belongs to user
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.uploadedById !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own files" },
        { status: 403 }
      );
    }

    // Delete file metadata from database
    await prisma.file.delete({
      where: { id: fileId },
    });

    // Invalidate cache
    await deleteCache(`files:user:${user.id}`);

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}
