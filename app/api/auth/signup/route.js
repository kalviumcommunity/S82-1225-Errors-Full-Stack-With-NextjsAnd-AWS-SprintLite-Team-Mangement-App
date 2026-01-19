import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAuthToken } from "@/lib/auth";
import { signupSchema } from "@/lib/schemas/authSchema";
import {
  sendSuccess,
  sendError,
  handlePrismaError,
  handleZodError,
  ERROR_CODES,
} from "@/lib/responseHandler";

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

    return sendSuccess({ user, token }, "Signup successful", 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return handlePrismaError(error);
  }
}
