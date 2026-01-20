import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import { sendSuccess, sendError, ERROR_CODES } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";
import { logRequest, logResponse } from "@/lib/logger";
import { getCache, setCache, deleteCachePattern } from "@/lib/redis";
import { requirePermission } from "@/lib/rbac-middleware";
import { RESOURCES, ACTIONS } from "@/lib/rbac";
import { validateRequestBody, detectXSS, detectSQLi, logSecurityThreat } from "@/lib/sanitization";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * GET /api/tasks
 * Fetch all tasks with pagination, filtering, and sorting
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - status: Filter by status (Todo, InProgress, Done)
 * - priority: Filter by priority (Low, Medium, High)
 * - assigneeId: Filter by assigned user
 * - creatorId: Filter by creator
 * - sortBy: Sort field (createdAt, dueDate, priority)
 * - sortOrder: Sort direction (asc, desc)
 */
export async function GET(request) {
  const startTime = Date.now();

  try {
    // RBAC: Check if user has read permission for tasks
    const authResult = await requirePermission(request, RESOURCES.TASKS, ACTIONS.READ);
    if (authResult.errorResponse) {
      console.log(`[RBAC] Access denied to GET /api/tasks`);
      return authResult.errorResponse;
    }

    const { user } = authResult;
    console.log(`[RBAC] User ${user.email} (${user.role}) accessing GET /api/tasks`);

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assigneeId = searchParams.get("assigneeId");
    const creatorId = searchParams.get("creatorId");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build cache key based on all query parameters
    const cacheKey = `tasks:list:page=${page}:limit=${limit}:status=${status || "all"}:priority=${priority || "all"}:assignee=${assigneeId || "all"}:creator=${creatorId || "all"}:sort=${sortBy}:${sortOrder}`;

    // Try cache first
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
        "Tasks fetched successfully (from cache)"
      );

      logResponse(request, response, 200);
      return response;
    }

    console.log(`❌ Cache MISS for ${cacheKey} - Fetching from database`);

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (creatorId) where.creatorId = creatorId;

    // Fetch tasks with pagination from database (removed transaction to fix timeout)
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const total = await prisma.task.count({ where });

    const totalPages = Math.ceil(total / limit);

    const data = {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        status,
        priority,
        assigneeId,
        creatorId,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };

    // Cache with 60 second TTL
    await setCache(cacheKey, data, 60);

    const responseTime = Date.now() - startTime;
    console.log(
      `� FETCHED ${tasks.length} tasks from database (total: ${total}) - ${responseTime}ms`
    );
    console.log(`�💾 Cached ${cacheKey} with 60s TTL (${responseTime}ms)`);

    const response = sendSuccess(
      {
        ...data,
        _cache: {
          hit: false,
          responseTime: `${responseTime}ms`,
        },
      },
      "Tasks fetched successfully"
    );

    logResponse(request, response, 200);
    return response;
  } catch (error) {
    return handleError(error, "GET /api/tasks");
  }
}

/**
 * POST /api/tasks
 * Create a new task
 *
 * Body:
 * - title: string (required)
 * - description: string (optional)
 * - status: string (optional, default: "Todo")
 * - priority: string (optional, default: "Medium")
 * - assigneeId: string (optional)
 * - dueDate: string (optional, ISO date)
 *
 * Note: creatorId is extracted from the JWT token
 */
export async function POST(request) {
  try {
    logRequest(request, "POST /api/tasks");

    // RBAC: Check if user has create permission for tasks
    const authResult = await requirePermission(request, RESOURCES.TASKS, ACTIONS.CREATE);
    if (authResult.errorResponse) {
      console.log(`[RBAC] Access denied to POST /api/tasks`);
      return authResult.errorResponse;
    }

    const { user } = authResult;
    const userId = user.id;
    console.log(`[RBAC] User ${user.email} (${user.role}) creating task`);

    const body = await request.json();

    // 🛡️ SECURITY: Validate and sanitize input
    const validation = validateRequestBody(body, {
      title: {
        type: "plain",
        required: true,
        minLength: 3,
        maxLength: 100,
        checkXSS: true,
      },
      description: {
        type: "rich",
        required: false,
        maxLength: 5000,
      },
      status: {
        type: "plain",
        required: false,
        maxLength: 20,
      },
      priority: {
        type: "plain",
        required: false,
        maxLength: 20,
      },
      assigneeId: {
        type: "none",
        required: false,
      },
      dueDate: {
        type: "none",
        required: false,
      },
    });

    if (!validation.valid) {
      console.error("[SECURITY] Task validation failed:", validation.errors);
      return sendError("Validation failed", 400, ERROR_CODES.VALIDATION_ERROR, validation.errors);
    }

    const { title, description, status, priority, assigneeId, dueDate } = validation.data;

    // 🛡️ SECURITY: Additional XSS/SQLi detection logging
    const xssCheck = detectXSS(title + (description || ""));
    const sqliCheck = detectSQLi(title + (description || ""));

    if (!xssCheck.safe) {
      logSecurityThreat("XSS_ATTEMPT", {
        userId: user.id,
        userEmail: user.email,
        endpoint: "/api/tasks",
        method: "POST",
        threats: xssCheck.threats,
        input: { title, description },
      });
    }

    if (!sqliCheck.safe) {
      logSecurityThreat("SQLI_ATTEMPT", {
        userId: user.id,
        userEmail: user.email,
        endpoint: "/api/tasks",
        method: "POST",
        threats: sqliCheck.threats,
        input: { title, description },
      });
    }

    // Create task with sanitized data
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || "Todo",
        priority: priority || "Medium",
        creatorId: userId, // Use the user ID from JWT token
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Invalidate all task list caches
    await deleteCachePattern("tasks:list:*");
    console.log("🗑️  Cache invalidated: tasks:list:* (new task created)");

    const response = sendSuccess(task, "Task created successfully", 201);
    logResponse(request, response, 201);
    return response;
  } catch (error) {
    return handleError(error, "POST /api/tasks");
  }
}

export const dynamic = "force-dynamic";
