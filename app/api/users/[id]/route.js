import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/users/[id]
 * Fetch a single user by ID with related data
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        createdTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            task: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            createdTasks: true,
            assignedTasks: true,
            comments: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update a user's information
 *
 * Body (all optional):
 * - name: string
 * - role: string
 * - avatar: string
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, role, avatar } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user and cascade to related data
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            createdTasks: true,
            assignedTasks: true,
            comments: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      deleted: {
        userId: id,
        cascaded: {
          createdTasks: existingUser._count.createdTasks,
          comments: existingUser._count.comments,
        },
      },
    });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
