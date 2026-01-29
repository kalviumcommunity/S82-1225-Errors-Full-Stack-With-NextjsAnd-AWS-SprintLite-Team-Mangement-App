/**
 * Swagger/OpenAPI Configuration
 * 
 * This file configures the OpenAPI 3.0 specification for the SprintLite API.
 * It documents all endpoints, authentication methods, data models, and server configurations.
 * 
 * Usage:
 * - Available at: /api/docs (via Next.js API route)
 * - Export: npm run docs:export
 * - Version: 1.0.0
 * - Last Updated: January 29, 2026
 */

import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SprintLite Team Management API',
      version: '1.0.0',
      description: 'Complete API documentation for SprintLite - a Next.js-based team task management application with AWS integration',
      contact: {
        name: 'SprintLite Development Team',
        url: 'https://github.com/kalviumcommunity/S82-1225-Errors-Full-Stack-With-NextjsAnd-AWS-SprintLite-Team-Mangement-App',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      termsOfService: 'https://sprintlite.com/terms',
      'x-logo': {
        url: 'https://sprintlite.com/logo.png',
        altText: 'SprintLite Logo',
      },
    },
    servers: [
      {
        url: 'https://app.sprintlite.com',
        description: 'Production environment',
        variables: {
          scheme: {
            enum: ['https'],
            default: 'https',
          },
        },
      },
      {
        url: 'https://staging.sprintlite.com',
        description: 'Staging environment',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development environment',
      },
    ],
    security: [
      {
        BearerAuth: [],
      },
      {
        CookieAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authentication token provided after login',
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'authToken',
          description: 'Authentication token stored in secure HTTP-only cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'USER'],
              description: 'User role for RBAC',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              description: 'User account status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last account update timestamp',
            },
          },
          required: ['id', 'email', 'name', 'role'],
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique task identifier',
            },
            title: {
              type: 'string',
              description: 'Task title',
            },
            description: {
              type: 'string',
              description: 'Detailed task description',
            },
            status: {
              type: 'string',
              enum: ['Todo', 'InProgress', 'Done'],
              description: 'Current task status',
            },
            priority: {
              type: 'string',
              enum: ['Low', 'Medium', 'High'],
              description: 'Task priority level',
            },
            assigneeId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of assigned user',
            },
            creatorId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of task creator',
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'Task due date',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
          required: ['id', 'title', 'status', 'priority', 'creatorId'],
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok', 'degraded'],
              description: 'Overall service status',
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Health check timestamp',
            },
            environment: {
              type: 'string',
              description: 'Current environment',
            },
            checks: {
              type: 'object',
              properties: {
                api_server: {
                  type: 'boolean',
                  description: 'API server health',
                },
                database: {
                  type: 'boolean',
                  description: 'Database connectivity',
                },
                cache: {
                  type: 'boolean',
                  description: 'Cache (Redis) connectivity',
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code for client handling',
            },
            status: {
              type: 'integer',
              description: 'HTTP status code',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
          required: ['error', 'status'],
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              description: 'Array of items',
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Current page number',
                },
                limit: {
                  type: 'integer',
                  description: 'Items per page',
                },
                total: {
                  type: 'integer',
                  description: 'Total number of items',
                },
                pages: {
                  type: 'integer',
                  description: 'Total number of pages',
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized - Missing or invalid authentication',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Forbidden - User lacks required permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        BadRequestError: {
          description: 'Bad request - Invalid parameters',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
      parameters: {
        pageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number (1-indexed)',
          schema: {
            type: 'integer',
            default: 1,
            minimum: 1,
          },
        },
        limitParam: {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100,
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Service health and status endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints',
      },
      {
        name: 'Assignments',
        description: 'Task assignments and tracking',
      },
      {
        name: 'Comments',
        description: 'Task comments and discussions',
      },
      {
        name: 'Files',
        description: 'File upload and management',
      },
      {
        name: 'Notifications',
        description: 'Email notifications and alerts',
      },
      {
        name: 'Admin',
        description: 'Administrative operations',
      },
    ],
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check endpoint',
          description: 'Returns service health status including uptime and component checks',
          operationId: 'getHealth',
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HealthCheck',
                  },
                },
              },
            },
            '503': {
              description: 'Service is degraded',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HealthCheck',
                  },
                },
              },
            },
          },
        },
      },
      '/api/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'Get all tasks',
          description: 'Retrieve tasks with pagination, filtering, and sorting',
          operationId: 'getTasks',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              $ref: '#/components/parameters/pageParam',
            },
            {
              $ref: '#/components/parameters/limitParam',
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter by task status',
              schema: {
                type: 'string',
                enum: ['Todo', 'InProgress', 'Done'],
              },
            },
            {
              name: 'priority',
              in: 'query',
              description: 'Filter by task priority',
              schema: {
                type: 'string',
                enum: ['Low', 'Medium', 'High'],
              },
            },
            {
              name: 'assigneeId',
              in: 'query',
              description: 'Filter by assigned user',
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
            {
              name: 'sortBy',
              in: 'query',
              description: 'Sort by field',
              schema: {
                type: 'string',
                enum: ['createdAt', 'dueDate', 'priority'],
              },
            },
            {
              name: 'sortOrder',
              in: 'query',
              description: 'Sort direction',
              schema: {
                type: 'string',
                enum: ['asc', 'desc'],
              },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Task',
                        },
                      },
                      pagination: {
                        type: 'object',
                      },
                    },
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
          },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Create a new task',
          description: 'Create a new task with provided details',
          operationId: 'createTask',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      minLength: 3,
                    },
                    description: {
                      type: 'string',
                    },
                    status: {
                      type: 'string',
                      enum: ['Todo', 'InProgress', 'Done'],
                    },
                    priority: {
                      type: 'string',
                      enum: ['Low', 'Medium', 'High'],
                    },
                    assigneeId: {
                      type: 'string',
                      format: 'uuid',
                    },
                    dueDate: {
                      type: 'string',
                      format: 'date',
                    },
                  },
                  required: ['title', 'status', 'priority'],
                },
                examples: {
                  example1: {
                    value: {
                      title: 'Implement user authentication',
                      description: 'Add JWT-based authentication',
                      status: 'InProgress',
                      priority: 'High',
                      dueDate: '2025-02-15',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Task created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Task',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/BadRequestError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
          },
        },
      },
      '/api/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Get task by ID',
          description: 'Retrieve a specific task by its ID',
          operationId: 'getTaskById',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Task found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Task',
                  },
                },
              },
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
          },
        },
        put: {
          tags: ['Tasks'],
          summary: 'Update a task',
          description: 'Update task details',
          operationId: 'updateTask',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                    },
                    description: {
                      type: 'string',
                    },
                    status: {
                      type: 'string',
                      enum: ['Todo', 'InProgress', 'Done'],
                    },
                    priority: {
                      type: 'string',
                      enum: ['Low', 'Medium', 'High'],
                    },
                    assigneeId: {
                      type: 'string',
                      format: 'uuid',
                    },
                    dueDate: {
                      type: 'string',
                      format: 'date',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Task updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Task',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/BadRequestError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
          },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete a task',
          description: 'Delete a task by ID',
          operationId: 'deleteTask',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Task deleted successfully',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
          },
        },
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Get all users',
          description: 'Retrieve all users (admin only)',
          operationId: 'getUsers',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              $ref: '#/components/parameters/pageParam',
            },
            {
              $ref: '#/components/parameters/limitParam',
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          description: 'Authenticate user and return JWT token',
          operationId: 'login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      minLength: 8,
                    },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: {
                        type: 'string',
                        description: 'JWT authentication token',
                      },
                      user: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/BadRequestError',
            },
            '401': {
              description: 'Invalid credentials',
            },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'User logout',
          description: 'Logout user and invalidate token',
          operationId: 'logout',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Logout successful',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
          },
        },
      },
    },
  },
  apis: ['./app/api/**/*.{js,ts}'],
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);
export default swaggerOptions;
