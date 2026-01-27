/**
 * AWS S3 Utility
 * Handles S3 client initialization and pre-signed URL generation
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Optionally, load AWS credentials from cloud secret manager at runtime
// import { getCloudSecrets } from './cloudSecrets';
// (async () => {
//   if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
//     const secrets = await getCloudSecrets();
//     process.env.AWS_ACCESS_KEY_ID = secrets.AWS_ACCESS_KEY_ID;
//     process.env.AWS_SECRET_ACCESS_KEY = secrets.AWS_SECRET_ACCESS_KEY;
//     process.env.AWS_REGION = secrets.AWS_REGION;
//     process.env.AWS_BUCKET_NAME = secrets.AWS_BUCKET_NAME;
//   }
// })();

/**
 * Generate a pre-signed URL for uploading a file to S3
 * @param {string} key - S3 object key (file path in bucket)
 * @param {string} mimeType - File MIME type
 * @param {number} expiresIn - URL expiration time in seconds (default: 60)
 * @returns {Promise<string>} Pre-signed upload URL
 */
export async function generateUploadUrl(key, mimeType, expiresIn = 60) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Get the public URL for an S3 object
 * @param {string} key - S3 object key
 * @returns {string} Public S3 URL
 */
export function getPublicUrl(key) {
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Validate file type and size
 * @param {string} mimeType - File MIME type
 * @param {number} size - File size in bytes
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(mimeType, size) {
  // Allowed MIME types: images and PDFs
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

  // Max file size: 10MB
  const maxSize = 10 * 1024 * 1024;

  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  if (size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

export default s3Client;
