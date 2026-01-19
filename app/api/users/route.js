import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { sendSuccess, sendError, handlePrismaError, ERROR_CODES } from "@/lib/responseHandler";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/users
 * Fetch all users with pagination and filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - role: Filter by role (Owner, Admin, Member)
 * - search: Search by name or email
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Build where clause
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users with pagination
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              createdTasks: true,
              assignedTasks: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Users fetched successfully"
    );
  } catch (error) {
    console.error("GET /api/users error:", error);
    return handlePrismaError(error);
  }
}

/**
 * POST /api/users
 * Create a new user
 *
 * Body:
 * - email: string (required, unique)
 * - name: string (required)
 * - password: string (required, will be hashed)
 * - role: string (optional, default: "Member")
 * - avatar: string (optional)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, password, role = "Member", avatar } = body;

    // Validation
    if (!email || !name || !password) {
      return sendError(
        "Missing required fields: email, name, password",
        ERROR_CODES.MISSING_REQUIRED_FIELDS,
        400,
        { required: ["email", "name", "password"] }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError("Invalid email format", ERROR_CODES.INVALID_INPUT, 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError("User with this email already exists", ERROR_CODES.USER_ALREADY_EXISTS, 409);
    }

    // Hash password
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return sendSuccess(user, "User created successfully", 201);
  } catch (error) {
    console.error("POST /api/users error:", error);
    return handlePrismaError(error);
  }
}
