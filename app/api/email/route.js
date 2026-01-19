/**
 * Email API - Send transactional emails
 * POST /api/email
 *
 * Request body:
 * {
 *   "to": "user@example.com",
 *   "subject": "Welcome!",
 *   "message": "<h1>Hello</h1>",
 *   "template": "welcome" // Optional: "welcome", "taskAssigned", "passwordReset"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "messageId": "010001example123",
 *   "requestId": "abc-123"
 * }
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  sendEmail,
  welcomeTemplate,
  taskAssignedTemplate,
  passwordResetTemplate,
} from "@/lib/email";
import { authenticateRequest } from "@/lib/auth";
import { handleError } from "@/lib/errorHandler";
import { logInfo, logError } from "@/lib/logger";

// Validation schema
const emailRequestSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().optional(),
  template: z.enum(["welcome", "taskAssigned", "passwordReset"]).optional(),
  templateData: z
    .object({
      userName: z.string().optional(),
      taskTitle: z.string().optional(),
      taskUrl: z.string().url().optional(),
      resetUrl: z.string().url().optional(),
      expiryMinutes: z.number().optional(),
    })
    .optional(),
});

export async function POST(request) {
  try {
    // Authenticate user (only authenticated users can send emails)
    const { user, errorResponse } = authenticateRequest(request);
    if (errorResponse) {
      return errorResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = emailRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { to, subject, message, template, templateData } = validation.data;

    // Generate HTML content
    let html = message;

    if (template && templateData) {
      switch (template) {
        case "welcome":
          html = welcomeTemplate(templateData.userName || "User");
          break;
        case "taskAssigned":
          html = taskAssignedTemplate(
            templateData.userName || "User",
            templateData.taskTitle || "New Task",
            templateData.taskUrl || "http://localhost:3000/tasks"
          );
          break;
        case "passwordReset":
          html = passwordResetTemplate(
            templateData.userName || "User",
            templateData.resetUrl || "http://localhost:3000/reset-password",
            templateData.expiryMinutes || 15
          );
          break;
      }
    }

    if (!html) {
      return NextResponse.json(
        {
          error: "Either message or template with templateData must be provided",
        },
        { status: 400 }
      );
    }

    // Send email
    logInfo(`Sending email to ${to} - Subject: ${subject}`, {
      userId: user.id,
      template,
    });

    const response = await sendEmail({
      to,
      subject,
      html,
    });

    logInfo(`Email sent successfully`, {
      messageId: response.messageId,
      requestId: response.requestId,
      to,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      messageId: response.messageId,
      requestId: response.requestId,
    });
  } catch (error) {
    logError("Email send failed", {
      error: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
    });

    return handleError(error);
  }
}

// GET /api/email - Check email configuration status
export async function GET(request) {
  try {
    // Authenticate user
    const { user, errorResponse } = authenticateRequest(request);
    if (errorResponse) {
      return errorResponse;
    }

    // Check if email configuration is complete
    const isConfigured =
      !!process.env.AWS_ACCESS_KEY_ID &&
      !!process.env.AWS_SECRET_ACCESS_KEY &&
      !!process.env.AWS_REGION &&
      !!process.env.SES_EMAIL_SENDER;

    return NextResponse.json({
      configured: isConfigured,
      sender: process.env.SES_EMAIL_SENDER || "Not configured",
      region: process.env.AWS_REGION || "Not configured",
      templates: ["welcome", "taskAssigned", "passwordReset"],
    });
  } catch (error) {
    return handleError(error);
  }
}
