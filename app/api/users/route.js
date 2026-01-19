import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";
import { authenticateRequest } from "@/lib/auth";
import { createUserSchema, userQuerySchema } from "@/lib/schemas/userSchema";
import { handleError } from "@/lib/errorHandler";
import { logRequest, logResponse } from "@/lib/logger";
import { getCache, setCache, deleteCachePattern } from "@/lib/redis";

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
  const startTime = Date.now(); // For performance measurement

  try {
    logRequest(request, "GET /api/users");

    const authResult = authenticateRequest(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const queryParams = userQuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      role: searchParams.get("role"),
      search: searchParams.get("search"),
    });

    // Extract validated parameters
    const { page, limit, role, search } = queryParams;
    const skip = (page - 1) * limit;

    // Build cache key based on query parameters
    const cacheKey = `users:list:page=${page}:limit=${limit}:role=${role || "all"}:search=${search || "none"}`;

    // Try to get from cache first (Cache-Aside Pattern)
    const cached = await getCache(cacheKey);
    if (cached) {
      const responseTime = Date.now() - startTime;
      console.log(`✅ Cache HIT for ${cacheKey} (${responseTime}ms)`);

      const response = sendSuccess(
        {
          ...cached,
          _cache: {
            hit: true,
            responseTime: `${responseTime}ms`,
          },
        },
        "Users fetched successfully (from cache)"
      );

      logResponse(request, response, 200);
      return response;
    }

    console.log(`❌ Cache MISS for ${cacheKey} - Fetching from database`);

    // Build where clause
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users with pagination from database
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

    const data = {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    // Cache the result with 60 second TTL
    await setCache(cacheKey, data, 60);

    const responseTime = Date.now() - startTime;
    console.log(`💾 Cached ${cacheKey} with 60s TTL (${responseTime}ms)`);

    const response = sendSuccess(
      {
        ...data,
        _cache: {
          hit: false,
          responseTime: `${responseTime}ms`,
        },
      },
      "Users fetched successfully"
    );

    logResponse(request, response, 200);
    return response;
  } catch (error) {
    return handleError(error, "GET /api/users");
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
    logRequest(request, "POST /api/users");

    const authResult = authenticateRequest(request);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await request.json();

    // Validate request body with Zod
    const validatedData = createUserSchema.parse(body);
    const { email, name, password, role, avatar } = validatedData;

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

    // Invalidate all user list caches (since a new user was added)
    await deleteCachePattern("users:list:*");
    console.log("🗑️  Cache invalidated: users:list:* (new user created)");

    const response = sendSuccess(user, "User created successfully", 201);
    logResponse(request, response, 201);
    return response;
  } catch (error) {
    return handleError(error, "POST /api/users");
  }
}
