# Object Storage Configuration (AWS S3)

## Overview
We implemented secure file uploads using AWS S3 in our Next.js app. This setup allows users to upload images (PNG/JPEG) directly to a private S3 bucket via presigned URLs, ensuring both security and scalability.

## Steps Completed
1. **S3 Bucket Creation**
   - Bucket Name: `sprintlite-uploads`
   - Public access blocked, versioning enabled for safety.

2. **IAM Permissions**
   - IAM user created with least-privilege policy:
     - `s3:PutObject`, `s3:GetObject` for `arn:aws:s3:::sprintlite-uploads/*`
   - Access keys stored securely in `.env.local`.

3. **Environment Variables**
   - AWS credentials and bucket name set in `.env.local`:
     - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`
   - Naming follows all-caps, underscore-separated convention for secrets.

4. **Presigned Upload API Route**
   - Implemented at `app/api/upload-url/route.js`.
   - Uses AWS SDK to generate presigned URLs for secure client uploads.
   - Validates file type (PNG/JPEG) server-side.

5. **Frontend Upload Flow**
   - Client fetches presigned URL and uploads file via HTTP PUT.
   - Client-side validation for file type and size (max 2MB).

6. **README Documentation**
   - Environment setup, secret management, and S3 configuration documented.
   - Security best practices and variable naming conventions explained.

7. **Security & Lifecycle**
   - Bucket is private by default.
   - IAM policy grants only required permissions.
   - Lifecycle policies (auto-delete/archive) recommended for cost control.

## Naming Conventions
- **Environment Variables:**
  - All caps, underscores, e.g., `AWS_S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`
- **Bucket Name:**
  - Lowercase, hyphen-separated, e.g., `sprintlite-uploads`
- **API Route:**
  - Lowercase, hyphen-separated, e.g., `upload-url`
- **Frontend Variables:**
  - `NEXT_PUBLIC_` prefix for client-exposed config

## Evidence
- API route: `app/api/upload-url/route.js`
- Bucket name: `sprintlite-uploads` (see `.env.local`)
- IAM policy: Least privilege, documented in README
- Validation: File type/size enforced in API and frontend
- README: Full documentation of setup and security

---
This completes the Object Storage Configuration assignment for SprintLite. All steps are implemented and documented following industry naming conventions and security best practices.
