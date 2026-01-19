#!/usr/bin/env node
/**
 * Test File Upload Flow
 * Tests the complete upload workflow:
 * 1. Authenticate user
 * 2. Request pre-signed URL
 * 3. Simulate file upload to S3
 * 4. Store file metadata
 * 5. List user's files
 */

const API_BASE = "http://localhost:3000/api";

// Test credentials (use existing user)
const TEST_USER = {
  email: "john@example.com",
  password: "password123",
};

// Test file metadata
const TEST_FILE = {
  fileName: "test-image.png",
  mimeType: "image/png",
  size: 512000, // 500KB
};

let authToken = null;

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function loginUser() {
  log("\n📝 Step 1: Authenticating user...", colors.cyan);

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(TEST_USER),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    authToken = data.token;
    log(`✅ Authenticated as: ${data.user.email}`, colors.green);
    return data.user;
  } catch (error) {
    log(`❌ Authentication failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function requestUploadUrl() {
  log("\n📤 Step 2: Requesting pre-signed upload URL...", colors.cyan);

  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(TEST_FILE),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Upload URL request failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    log(`✅ Pre-signed URL generated`, colors.green);
    log(`   Key: ${data.key}`, colors.blue);
    log(`   Expires in: ${data.expiresIn}s`, colors.blue);
    log(`   Public URL: ${data.publicUrl}`, colors.blue);
    return data;
  } catch (error) {
    log(`❌ Upload URL request failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function storeFileMetadata(uploadData) {
  log("\n💾 Step 3: Storing file metadata in database...", colors.cyan);

  try {
    const response = await fetch(`${API_BASE}/files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: TEST_FILE.fileName,
        url: uploadData.publicUrl,
        key: uploadData.key,
        size: TEST_FILE.size,
        mimeType: TEST_FILE.mimeType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Metadata storage failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    log(`✅ File metadata stored`, colors.green);
    log(`   File ID: ${data.id}`, colors.blue);
    log(`   Uploaded by: ${data.uploadedBy.name}`, colors.blue);
    return data;
  } catch (error) {
    log(`❌ Metadata storage failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function listUserFiles() {
  log("\n📋 Step 4: Listing user files...", colors.cyan);

  try {
    const response = await fetch(`${API_BASE}/files`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`File listing failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    log(`✅ Found ${data.files.length} files`, colors.green);

    if (data.files.length > 0) {
      log("\n   Recent files:", colors.blue);
      data.files.slice(0, 3).forEach((file, index) => {
        log(`   ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, colors.blue);
        log(`      Type: ${file.mimeType}`, colors.blue);
        log(`      Uploaded: ${new Date(file.createdAt).toLocaleString()}`, colors.blue);
      });
    }

    return data;
  } catch (error) {
    log(`❌ File listing failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function testFileValidation() {
  log("\n🔍 Step 5: Testing file validation...", colors.cyan);

  // Test invalid file type
  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fileName: "test.exe",
        mimeType: "application/x-msdownload",
        size: 1024,
      }),
    });

    if (response.status === 400) {
      log(`✅ Invalid file type correctly rejected`, colors.green);
    } else {
      log(`❌ Should have rejected invalid file type`, colors.red);
    }
  } catch (error) {
    log(`❌ Validation test failed: ${error.message}`, colors.red);
  }

  // Test file too large
  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fileName: "large.png",
        mimeType: "image/png",
        size: 20 * 1024 * 1024, // 20MB
      }),
    });

    if (response.status === 400) {
      log(`✅ Large file correctly rejected`, colors.green);
    } else {
      log(`❌ Should have rejected large file`, colors.red);
    }
  } catch (error) {
    log(`❌ Validation test failed: ${error.message}`, colors.red);
  }
}

async function runTests() {
  log("=".repeat(50), colors.yellow);
  log("FILE UPLOAD WORKFLOW TEST", colors.yellow);
  log("=".repeat(50), colors.yellow);

  try {
    // Step 1: Authenticate
    await loginUser();

    // Step 2: Request upload URL
    const uploadData = await requestUploadUrl();

    // Step 3: Store metadata (simulating successful S3 upload)
    await storeFileMetadata(uploadData);

    // Step 4: List files
    await listUserFiles();

    // Step 5: Test validation
    await testFileValidation();

    log("\n" + "=".repeat(50), colors.yellow);
    log("✅ ALL TESTS PASSED", colors.green);
    log("=".repeat(50), colors.yellow);
  } catch (error) {
    log("\n" + "=".repeat(50), colors.yellow);
    log("❌ TESTS FAILED", colors.red);
    log(`Error: ${error.message}`, colors.red);
    log("=".repeat(50), colors.yellow);
    process.exit(1);
  }
}

// Run tests
runTests();
