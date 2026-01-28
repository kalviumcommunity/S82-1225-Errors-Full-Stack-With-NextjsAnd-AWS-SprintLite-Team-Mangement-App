import { NextResponse } from "next/server";
import { getCloudSecrets } from "@/lib/cloudSecrets";

export async function GET(request) {
  try {
    // Attempt to retrieve secrets from cloud
    const secrets = await getCloudSecrets();

    // Return only the keys (never expose actual values!)
    const secretKeys = Object.keys(secrets);

    return NextResponse.json({
      status: "success",
      message: "✅ Secrets retrieved successfully from AWS Secrets Manager at runtime",
      secretKeys,
      count: secretKeys.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "❌ Failed to retrieve secrets from cloud",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
