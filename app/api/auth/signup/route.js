import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { signAuthToken } from "@/lib/auth";
import { signupSchema } from "@/lib/schemas/authSchema";
import { sendError, handlePrismaError, handleZodError, ERROR_CODES } from "@/lib/responseHandler";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = signupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError("User with this email already exists", ERROR_CODES.USER_ALREADY_EXISTS, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });

    // Set cookie using next/headers cookies function
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        data: { user, token },
        message: "Signup successful",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return handlePrismaError(error);
  }
}
