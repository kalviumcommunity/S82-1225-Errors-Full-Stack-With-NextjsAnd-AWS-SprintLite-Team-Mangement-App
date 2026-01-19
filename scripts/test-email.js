#!/usr/bin/env node
/**
 * Test Email Sending Flow
 * Tests AWS SES transactional email functionality:
 * 1. Check email configuration
 * 2. Send welcome email
 * 3. Send task assigned email
 * 4. Send password reset email
 * 5. Send custom HTML email
 */

const API_BASE = "http://localhost:3000/api";

// Test credentials (use existing user)
const TEST_USER = {
  email: "john@example.com",
  password: "password123",
};

// Test recipient email (MUST be verified in SES sandbox)
const TEST_RECIPIENT = "john@example.com"; // Change to your verified email

let authToken = null;

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
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

async function checkEmailConfig() {
  log("\n⚙️  Step 2: Checking email configuration...", colors.cyan);

  try {
    const response = await fetch(`${API_BASE}/email`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Config check failed: ${response.status}`);
    }

    const data = await response.json();
    log(`✅ Email service configured`, colors.green);
    log(`   Sender: ${data.sender}`, colors.blue);
    log(`   Region: ${data.region}`, colors.blue);
    log(`   Available templates: ${data.templates.join(", ")}`, colors.blue);
    return data;
  } catch (error) {
    log(`❌ Config check failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function sendWelcomeEmail(userName) {
  log("\n📧 Step 3: Sending welcome email...", colors.cyan);

  try {
    const response = await fetch(`${API_BASE}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        to: TEST_RECIPIENT,
        subject: "Welcome to SprintLite! 🎉",
        template: "welcome",
        templateData: {
          userName,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Email send failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    log(`✅ Welcome email sent`, colors.green);
    log(`   Message ID: ${data.messageId}`, colors.blue);
    log(`   Request ID: ${data.requestId}`, colors.blue);
    return data;
  } catch (error) {
    log(`❌ Welcome email failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function sendTaskAssignedEmail(userName) {
  log("\n📋 Step 4: Sending task assigned email...", colors.cyan);

  try {
    const response = await fetch(`${API_BASE}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        to: TEST_RECIPIENT,
        subject: "New Task Assigned: Implement Email Service",
        template: "taskAssigned",
        templateData: {
          userName,
          taskTitle: "Implement AWS SES Email Service",
          taskUrl: "http://localhost:3000/tasks/123",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Email send failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    log(`✅ Task assigned email sent`, colors.green);
    log(`   Message ID: ${data.messageId}`, colors.blue);
    return data;
  } catch (error) {
    log(`❌ Task assigned email failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function sendPasswordResetEmail(userName) {
  log("\n🔐 Step 5: Sending password reset email...", colors.cyan);

  try {
    const response = await fetch(`${API_BASE}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        to: TEST_RECIPIENT,
        subject: "Password Reset Request",
        template: "passwordReset",
        templateData: {
          userName,
          resetUrl: "http://localhost:3000/reset-password?token=abc123xyz",
          expiryMinutes: 15,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Email send failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    log(`✅ Password reset email sent`, colors.green);
    log(`   Message ID: ${data.messageId}`, colors.blue);
    return data;
  } catch (error) {
    log(`❌ Password reset email failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function sendCustomEmail() {
  log("\n✨ Step 6: Sending custom HTML email...", colors.cyan);

  try {
    const customHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #667eea;">Custom Email Test</h2>
          <p style="color: #666; line-height: 1.6;">
            This is a custom HTML email sent via AWS SES. It demonstrates:
          </p>
          <ul style="color: #666;">
            <li>Custom HTML content</li>
            <li>Inline CSS styling</li>
            <li>Professional email formatting</li>
          </ul>
          <div style="margin-top: 20px; padding: 15px; background-color: #f0f4ff; border-left: 4px solid #667eea;">
            <strong>✅ Email service is working correctly!</strong>
          </div>
        </div>
      </div>
    `;

    const response = await fetch(`${API_BASE}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        to: TEST_RECIPIENT,
        subject: "Custom Email Test - SprintLite",
        message: customHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Email send failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    log(`✅ Custom email sent`, colors.green);
    log(`   Message ID: ${data.messageId}`, colors.blue);
    return data;
  } catch (error) {
    log(`❌ Custom email failed: ${error.message}`, colors.red);
    throw error;
  }
}

async function runTests() {
  log("=".repeat(60), colors.yellow);
  log("AWS SES TRANSACTIONAL EMAIL TEST", colors.yellow);
  log("=".repeat(60), colors.yellow);

  log(
    `\n⚠️  IMPORTANT: Recipient email (${TEST_RECIPIENT}) must be verified in SES sandbox!`,
    colors.yellow
  );
  log("   Visit: AWS Console → SES → Verified Identities", colors.yellow);

  try {
    // Step 1: Authenticate
    const user = await loginUser();

    // Step 2: Check configuration
    await checkEmailConfig();

    // Step 3-6: Send different types of emails
    await sendWelcomeEmail(user.name);
    await sendTaskAssignedEmail(user.name);
    await sendPasswordResetEmail(user.name);
    await sendCustomEmail();

    log("\n" + "=".repeat(60), colors.yellow);
    log("✅ ALL EMAIL TESTS PASSED", colors.green);
    log("=".repeat(60), colors.yellow);

    log("\n📬 Check your inbox:", colors.cyan);
    log(`   Email: ${TEST_RECIPIENT}`, colors.blue);
    log("   Expected emails: 4 (Welcome, Task, Reset, Custom)", colors.blue);
    log("\n💡 Note: Emails may take 1-2 minutes to arrive", colors.yellow);
    log("💡 Check spam folder if not in inbox", colors.yellow);
  } catch (error) {
    log("\n" + "=".repeat(60), colors.yellow);
    log("❌ TESTS FAILED", colors.red);
    log(`Error: ${error.message}`, colors.red);
    log("=".repeat(60), colors.yellow);

    log("\n🔍 Troubleshooting:", colors.cyan);
    log("   1. Verify sender email in AWS SES Console", colors.blue);
    log("   2. Verify recipient email in SES sandbox", colors.blue);
    log("   3. Check AWS credentials in .env.development", colors.blue);
    log("   4. Ensure correct AWS region (ap-south-1)", colors.blue);

    process.exit(1);
  }
}

// Run tests
runTests();
