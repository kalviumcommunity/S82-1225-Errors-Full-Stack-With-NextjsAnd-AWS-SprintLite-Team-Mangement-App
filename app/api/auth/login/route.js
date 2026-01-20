import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAuthToken } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas/authSchema";
import { sendError, handlePrismaError, handleZodError, ERROR_CODES } from "@/lib/responseHandler";

export async function POST(request) {
  try {
    console.log("Login API called");
    const body = await request.json();
    console.log("Request body:", body);
    const { email, password } = loginSchema.parse(body);
    console.log("Schema validated");

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found:", user ? "yes" : "no");

    if (!user) {
      return sendError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });

    console.log("Token generated:", token.substring(0, 20) + "...");

    const cookieValue = `token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
    console.log("Setting cookie:", cookieValue.substring(0, 50) + "...");

    // Use native Response API
    const response = new Response(
      JSON.stringify({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          },
        },
        message: "Login successful",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieValue,
        },
      }
    );

    console.log("Response created with Set-Cookie header");
    return response;
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return handlePrismaError(error);
  }
}
