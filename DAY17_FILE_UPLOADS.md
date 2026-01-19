# DAY 17: Secure File Uploads with AWS S3 Pre-Signed URLs

## 🎯 Learning Objective
**2.23 File Uploads**: Implement secure file upload functionality using AWS S3 pre-signed URLs with proper validation, metadata storage, and access control.

## 📋 Overview
Implemented a complete file upload system that:
- ✅ Generates pre-signed URLs for direct S3 uploads (client → S3)
- ✅ Validates file types (images, PDFs) and sizes (max 10MB)
- ✅ Stores file metadata in PostgreSQL
- ✅ Provides public file access with secure URLs
- ✅ Implements caching for file listings
- ✅ Supports file lifecycle management

## 🏗️ Architecture

### Upload Flow
```
Client Request → API Route → Generate Pre-Signed URL → Return to Client
                                                              ↓
                                                    Client uploads to S3
                                                              ↓
                                            Client notifies API → Store metadata → DB
```

### Components
1. **S3 Utility** (`lib/s3.js`)
   - S3 client initialization
   - Pre-signed URL generation
   - File validation (type & size)
   - Public URL generation

2. **Upload API** (`app/api/upload/route.js`)
   - POST endpoint to request upload URLs
   - Validates file metadata before generating URL
   - 60-second URL expiration

3. **Files API** (`app/api/files/route.js`)
   - POST: Store file metadata after upload
   - GET: List user's files with pagination
   - DELETE: Remove file metadata (soft delete)
   - Redis caching for listings

4. **Database Model** (Prisma)
   - File table with metadata
   - Relations to User (uploadedBy)
   - Indexes on uploadedById, createdAt, mimeType

## 📁 File Structure
```
lib/
  s3.js                     # AWS S3 utilities
app/api/
  upload/
    route.js                # Pre-signed URL generation
  files/
    route.js                # File metadata management
prisma/
  schema.prisma            # Added File model
scripts/
  test-file-upload.js      # Automated upload testing
```

## 🔧 Configuration

### Environment Variables (.env.development)
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID='your-access-key-id'
AWS_SECRET_ACCESS_KEY='your-secret-access-key'
AWS_REGION='ap-south-1'
AWS_BUCKET_NAME='sprintlite-uploads'
```

### S3 Bucket Setup
1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://sprintlite-uploads --region ap-south-1
   ```

2. **Configure Bucket Policy** (Public Read Access)
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::sprintlite-uploads/*"
       }
     ]
   }
   ```

3. **Configure CORS**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "POST", "GET"],
       "AllowedOrigins": ["http://localhost:3000"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

4. **Configure Lifecycle Rule** (Auto-delete after 30 days)
   ```json
   {
     "Rules": [
       {
         "Id": "DeleteOldFiles",
         "Status": "Enabled",
         "Prefix": "uploads/",
         "Expiration": {
           "Days": 30
         }
       }
     ]
   }
   ```

## 🔐 File Validation

### Allowed File Types
- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Documents: `application/pdf`

### Size Limits
- Maximum: 10MB per file
- Validated on both API request and S3 upload

## 🚀 API Usage

### 1. Request Upload URL
```bash
POST /api/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "profile.png",
  "mimeType": "image/png",
  "size": 512000
}
```

**Response:**
```json
{
  "uploadUrl": "https://sprintlite-uploads.s3.ap-south-1.amazonaws.com/uploads/user123/...",
  "key": "uploads/user123/1234567890-abc123.png",
  "publicUrl": "https://sprintlite-uploads.s3.ap-south-1.amazonaws.com/uploads/user123/1234567890-abc123.png",
  "expiresIn": 60
}
```

### 2. Upload File to S3
```bash
curl -X PUT \
  -H "Content-Type: image/png" \
  --data-binary @profile.png \
  "https://sprintlite-uploads.s3.ap-south-1.amazonaws.com/uploads/user123/..."
```

### 3. Store File Metadata
```bash
POST /api/files
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "profile.png",
  "url": "https://sprintlite-uploads.s3.ap-south-1.amazonaws.com/uploads/user123/1234567890-abc123.png",
  "key": "uploads/user123/1234567890-abc123.png",
  "size": 512000,
  "mimeType": "image/png"
}
```

### 4. List Files
```bash
GET /api/files?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "files": [
    {
      "id": "file123",
      "name": "profile.png",
      "url": "https://...",
      "key": "uploads/user123/...",
      "size": 512000,
      "mimeType": "image/png",
      "uploadedBy": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### 5. Delete File Metadata
```bash
DELETE /api/files?id=file123
Authorization: Bearer <token>
```

## 🧪 Testing

### Automated Test
```bash
node scripts/test-file-upload.js
```

**Test Coverage:**
- ✅ User authentication
- ✅ Pre-signed URL generation
- ✅ Metadata storage
- ✅ File listing with pagination
- ✅ Invalid file type rejection
- ✅ Oversized file rejection

### Manual Testing with curl

#### Complete Upload Flow
```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  | jq -r '.token')

# 2. Request upload URL
UPLOAD_DATA=$(curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"fileName":"test.png","mimeType":"image/png","size":512000}')

UPLOAD_URL=$(echo $UPLOAD_DATA | jq -r '.uploadUrl')
PUBLIC_URL=$(echo $UPLOAD_DATA | jq -r '.publicUrl')
KEY=$(echo $UPLOAD_DATA | jq -r '.key')

# 3. Upload file to S3
curl -X PUT \
  -H "Content-Type: image/png" \
  --data-binary @test.png \
  "$UPLOAD_URL"

# 4. Store metadata
curl -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"test.png\",\"url\":\"$PUBLIC_URL\",\"key\":\"$KEY\",\"size\":512000,\"mimeType\":\"image/png\"}"

# 5. List files
curl http://localhost:3000/api/files \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Performance Features

### Caching Strategy
- **File Listings**: 60-second TTL
- **Cache Keys**: `files:user:{userId}:page:{page}:limit:{limit}`
- **Invalidation**: On POST (new file) and DELETE

### Database Optimization
- Indexed queries on `uploadedById`, `createdAt`, `mimeType`
- Pagination support (default: 20 per page)

## 🔒 Security Features

### Authentication & Authorization
- ✅ JWT token required for all endpoints
- ✅ Users can only access their own files
- ✅ Pre-signed URLs expire in 60 seconds

### File Validation
- ✅ MIME type whitelist
- ✅ Size limits enforced
- ✅ File extension validation

### S3 Security
- ✅ Pre-signed URLs prevent credential exposure
- ✅ Time-limited upload URLs
- ✅ Public read, authenticated write

## 🌐 Public Access Considerations

### Current Implementation: "Anyone with Link"
- Files are publicly readable via S3 URLs
- No authentication required to view files
- Links are not guessable (UUID-based keys)

### Alternative: Private Files
To implement private file access:
1. Remove public bucket policy
2. Generate pre-signed GET URLs in `/api/files`
3. Add expiration to download links
4. Implement access control checks

```javascript
// Private file access example
import { GetObjectCommand } from '@aws-sdk/client-s3';

async function generateDownloadUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
}
```

## 📈 Metrics & Monitoring

### Key Metrics
- Upload success rate
- Average file size
- Files per user
- Storage used per user

### Logging
All operations logged with:
- User ID
- File metadata
- Operation type
- Timestamp

## 🗑️ Lifecycle Management

### Auto-Deletion (S3 Lifecycle Policy)
- Files in `uploads/` prefix deleted after 30 days
- Reduces storage costs
- Automatic cleanup

### Manual Cleanup
```javascript
// Delete file from S3
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });
  await s3Client.send(command);
}
```

## 🎨 Frontend Integration Example

```javascript
async function uploadFile(file) {
  // 1. Request upload URL
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    }),
  });
  
  const { uploadUrl, publicUrl, key } = await response.json();
  
  // 2. Upload to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  
  // 3. Store metadata
  await fetch('/api/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: file.name,
      url: publicUrl,
      key,
      size: file.size,
      mimeType: file.type,
    }),
  });
  
  return publicUrl;
}
```

## 🚧 Future Enhancements
- [ ] Image thumbnail generation (Lambda)
- [ ] Virus scanning (ClamAV)
- [ ] CDN integration (CloudFront)
- [ ] Multiple file upload
- [ ] Progress tracking
- [ ] File versioning
- [ ] Shared folders/permissions
- [ ] File preview generation

## 📝 Reflection

### What Went Well
- Pre-signed URLs eliminate server upload bandwidth
- Client-side uploads are fast and scalable
- Validation prevents misuse
- Caching improves listing performance

### Challenges
- S3 bucket configuration (CORS, policies)
- Balancing public vs private access
- Handling upload failures (orphaned metadata)

### Key Learnings
- Pre-signed URLs are more secure than direct credential exposure
- Lifecycle policies reduce storage costs automatically
- File validation is critical at multiple layers
- Public access requires careful security consideration

---

**Status**: ✅ Complete  
**Date**: January 2024  
**Next**: DAY 18 - Advanced features or monitoring
