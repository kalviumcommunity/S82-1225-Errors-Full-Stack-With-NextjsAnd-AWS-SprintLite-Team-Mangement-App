import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAuthToken } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas/authSchema";
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
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });

    return sendSuccess(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      },
      "Login successful"
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return handlePrismaError(error);
  }
}
