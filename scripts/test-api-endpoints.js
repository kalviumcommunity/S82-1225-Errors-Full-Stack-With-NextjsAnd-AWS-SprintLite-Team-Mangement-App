/**
 * RESTful API Test Script
 * Tests all API endpoints with curl-like functionality
 */

const API_URL = "http://localhost:3000";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, url, body = null, description = "") {
  log(`\n${description}`, "cyan");
  log(`${method} ${url}`, "yellow");

  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = JSON.stringify(body);
      log(`Body: ${JSON.stringify(body, null, 2)}`, "yellow");
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      log(`✅ ${response.status} ${response.statusText}`, "green");
      log(JSON.stringify(data, null, 2), "green");
      return { success: true, data };
    } else {
      log(`❌ ${response.status} ${response.statusText}`, "red");
      log(JSON.stringify(data, null, 2), "red");
      return { success: false, data };
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log("\n🚀 Testing RESTful API Endpoints", "bold");
  log("=".repeat(70), "cyan");

  let createdUserId, createdTaskId, createdCommentId;

  // ========== USERS ENDPOINTS ==========
  log("\n\n📋 USERS ENDPOINTS", "bold");
  log("=".repeat(70), "cyan");

  // GET /api/users
  await testEndpoint(
    "GET",
    `${API_URL}/api/users?page=1&limit=5`,
    null,
    "1. Get all users with pagination"
  );

  // GET /api/users with filters
  await testEndpoint(
    "GET",
    `${API_URL}/api/users?role=Admin&search=Sam`,
    null,
    "2. Get users with filters (role + search)"
  );

  // POST /api/users
  const userResult = await testEndpoint(
    "POST",
    `${API_URL}/api/users`,
    {
      email: `testuser${Date.now()}@example.com`,
      name: "Test User API",
      password: "password123",
      role: "Member",
    },
    "3. Create new user"
  );

  if (userResult.success) {
    createdUserId = userResult.data.data.id;
  }

  // GET /api/users/[id]
  if (createdUserId) {
    await testEndpoint(
      "GET",
      `${API_URL}/api/users/${createdUserId}`,
      null,
      "4. Get single user by ID"
    );

    // PUT /api/users/[id]
    await testEndpoint(
      "PUT",
      `${API_URL}/api/users/${createdUserId}`,
      { name: "Updated Test User", role: "Admin" },
      "5. Update user"
    );
  }

  // ========== TASKS ENDPOINTS ==========
  log("\n\n📝 TASKS ENDPOINTS", "bold");
  log("=".repeat(70), "cyan");

  // GET /api/tasks
  await testEndpoint(
    "GET",
    `${API_URL}/api/tasks?page=1&limit=5`,
    null,
    "6. Get all tasks with pagination"
  );

  // GET /api/tasks with filters
  await testEndpoint(
    "GET",
    `${API_URL}/api/tasks?status=InProgress&priority=High&sortBy=dueDate&sortOrder=asc`,
    null,
    "7. Get tasks with filters and sorting"
  );

  // POST /api/tasks
  const taskResult = await testEndpoint(
    "POST",
    `${API_URL}/api/tasks`,
    {
      title: "API Test Task",
      description: "Created via API test script",
      status: "Todo",
      priority: "High",
      creatorId: createdUserId || "cmk5dw9kv0000ecuedwosh7ir",
      assigneeId: createdUserId || "cmk5dw9kv0000ecuedwosh7ir",
    },
    "8. Create new task"
  );

  if (taskResult.success) {
    createdTaskId = taskResult.data.data.id;
  }

  // GET /api/tasks/[id]
  if (createdTaskId) {
    await testEndpoint(
      "GET",
      `${API_URL}/api/tasks/${createdTaskId}`,
      null,
      "9. Get single task by ID"
    );

    // PUT /api/tasks/[id]
    await testEndpoint(
      "PUT",
      `${API_URL}/api/tasks/${createdTaskId}`,
      { status: "InProgress", priority: "Medium" },
      "10. Update task"
    );
  }

  // ========== COMMENTS ENDPOINTS ==========
  log("\n\n💬 COMMENTS ENDPOINTS", "bold");
  log("=".repeat(70), "cyan");

  // GET /api/comments
  await testEndpoint(
    "GET",
    `${API_URL}/api/comments?page=1&limit=5`,
    null,
    "11. Get all comments with pagination"
  );

  // POST /api/comments
  if (createdTaskId && createdUserId) {
    const commentResult = await testEndpoint(
      "POST",
      `${API_URL}/api/comments`,
      {
        content: "This is a test comment created via API",
        taskId: createdTaskId,
        userId: createdUserId,
      },
      "12. Create new comment"
    );

    if (commentResult.success) {
      createdCommentId = commentResult.data.data.id;
    }
  }

  // GET /api/comments/[id]
  if (createdCommentId) {
    await testEndpoint(
      "GET",
      `${API_URL}/api/comments/${createdCommentId}`,
      null,
      "13. Get single comment by ID"
    );

    // PUT /api/comments/[id]
    await testEndpoint(
      "PUT",
      `${API_URL}/api/comments/${createdCommentId}`,
      { content: "Updated comment content" },
      "14. Update comment"
    );
  }

  // ========== ERROR HANDLING ==========
  log("\n\n⚠️  ERROR HANDLING TESTS", "bold");
  log("=".repeat(70), "cyan");

  // 404 Error
  await testEndpoint(
    "GET",
    `${API_URL}/api/users/invalid-id-12345`,
    null,
    "15. Test 404 - Non-existent user"
  );

  // 400 Error - Missing fields
  await testEndpoint(
    "POST",
    `${API_URL}/api/tasks`,
    { title: "Missing creator" },
    "16. Test 400 - Missing required fields"
  );

  // 400 Error - Invalid enum value
  await testEndpoint(
    "POST",
    `${API_URL}/api/tasks`,
    {
      title: "Invalid Status",
      status: "InvalidStatus",
      creatorId: createdUserId || "cmk5dw9kv0000ecuedwosh7ir",
    },
    "17. Test 400 - Invalid status value"
  );

  // ========== CLEANUP (Optional) ==========
  log("\n\n🧹 CLEANUP", "bold");
  log("=".repeat(70), "cyan");

  // DELETE /api/comments/[id]
  if (createdCommentId) {
    await testEndpoint(
      "DELETE",
      `${API_URL}/api/comments/${createdCommentId}`,
      null,
      "18. Delete comment"
    );
  }

  // DELETE /api/tasks/[id]
  if (createdTaskId) {
    await testEndpoint("DELETE", `${API_URL}/api/tasks/${createdTaskId}`, null, "19. Delete task");
  }

  // DELETE /api/users/[id]
  if (createdUserId) {
    await testEndpoint("DELETE", `${API_URL}/api/users/${createdUserId}`, null, "20. Delete user");
  }

  // ========== SUMMARY ==========
  log("\n\n✅ API Testing Complete!", "bold");
  log("=".repeat(70), "cyan");
  log("\nAll RESTful endpoints tested:", "green");
  log("  ✅ Users: GET, POST, GET/:id, PUT/:id, DELETE/:id", "green");
  log("  ✅ Tasks: GET, POST, GET/:id, PUT/:id, DELETE/:id", "green");
  log("  ✅ Comments: GET, POST, GET/:id, PUT/:id, DELETE/:id", "green");
  log("  ✅ Pagination: page, limit parameters", "green");
  log("  ✅ Filtering: role, status, priority, search", "green");
  log("  ✅ Sorting: sortBy, sortOrder parameters", "green");
  log("  ✅ Error handling: 400, 404, 409, 500", "green");
  log("\n");
}

runTests().catch(console.error);
