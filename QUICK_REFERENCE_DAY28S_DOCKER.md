# 🐳 Docker Build & Push - Quick Reference

## ✅ What We Have

### Dockerfile
- **Location**: `./Dockerfile`
- **Strategy**: Multi-stage build
- **Stages**: deps → builder → runner
- **Final Size**: 200-300 MB
- **Security**: Non-root user (nextjs:1001)

### Docker Job in CI
- **Location**: `.github/workflows/ci.yml` (lines ~190-225)
- **Trigger**: On push (all branches)
- **Dependencies**: lint + test-database must pass
- **Output**: Image pushed to AWS ECR

### Required Secrets
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- AWS_ECR_REPOSITORY

---

## 🚀 Pipeline Flow

### When Code Pushed

```
Push to GitHub
    ↓
Lint (2-3 min)
    ↓
Test (5-10 min)
    ↓
Database Check (2-3 min)
    ↓
Docker Build (5-10 min)
    ├─ Configure AWS
    ├─ Login to ECR
    ├─ Build image (multi-stage)
    ├─ Push SHA tag
    └─ Push latest tag
    ↓
Image in ECR ✅
```

---

## 🐳 Docker Build Process

### Three Build Stages

```
Stage 1: deps
├─ npm ci
└─ node_modules (500MB)

Stage 2: builder
├─ Copy deps
├─ npm run build
└─ .next folder

Stage 3: runner
├─ Copy only necessary files
├─ Non-root user
└─ 200-300 MB final
```

### Size Reduction

```
Without multi-stage: 1-2 GB
With multi-stage: 200-300 MB
Savings: 80% smaller! ✅
```

---

## 🏷️ Image Tagging

### Two Tags per Build

```
1. SHA Tag (unique per commit)
   ├─ Example: a1b2c3d
   ├─ Purpose: Specific version
   └─ Use: Rollback to any commit

2. Latest Tag
   ├─ Purpose: Current version
   ├─ Points to latest build
   └─ Use: Easy deployment
```

### AWS ECR Location

```
aws-account.dkr.ecr.region.amazonaws.com/sprintlite:a1b2c3d
aws-account.dkr.ecr.region.amazonaws.com/sprintlite:latest
```

---

## 🔐 Security Features

### Dockerfile Security
- ✅ Alpine Linux (minimal base)
- ✅ Non-root user (security best practice)
- ✅ Production dependencies only
- ✅ No build tools in final image

### Workflow Security
- ✅ GitHub Secrets (never logged)
- ✅ AWS IAM authentication
- ✅ Credentials masked in logs
- ✅ ECR private repository

---

## 🔧 Setup Checklist

- [ ] Configure GitHub Secrets:
  - [ ] AWS_ACCESS_KEY_ID
  - [ ] AWS_SECRET_ACCESS_KEY
  - [ ] AWS_REGION
  - [ ] AWS_ECR_REPOSITORY

- [ ] Verify AWS IAM permissions:
  - [ ] ecr:GetAuthorizationToken
  - [ ] ecr:GetDownloadUrlForLayer
  - [ ] ecr:BatchGetImage
  - [ ] ecr:PutImage
  - [ ] ecr:InitiateLayerUpload
  - [ ] ecr:UploadLayerPart
  - [ ] ecr:CompleteLayerUpload

- [ ] Test pipeline:
  - [ ] Push code
  - [ ] Watch docker-build job
  - [ ] Verify in AWS ECR
  - [ ] Check image tags

---

## 📊 Commands Reference

### Local Testing

```bash
# Build locally
docker build -t sprintlite:test .

# Run locally
docker run -p 3000:3000 sprintlite:test

# Check size
docker images sprintlite

# Check user
docker run sprintlite:test whoami
```

### Git Commands

```bash
# Create branch
git checkout -b DAY28-S/DOCKER-BUILD

# Push to trigger
git push origin DAY28-S/DOCKER-BUILD

# View logs
# Go to Actions tab in GitHub
```

### AWS Commands (manual)

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin \
aws-account.dkr.ecr.us-east-1.amazonaws.com

# List images
aws ecr describe-images --repository-name sprintlite

# Pull image
docker pull aws-account.dkr.ecr.us-east-1.amazonaws.com/sprintlite:latest
```

---

## ✅ Testing Pipeline

### Method 1: Push Code
```bash
git push origin DAY28-S/DOCKER-BUILD
# Go to Actions tab
# Wait for docker-build job
# Check for ✅
```

### Method 2: Manual Dispatch
1. GitHub Actions tab
2. Select "CI Pipeline"
3. Click "Run workflow"
4. Select branch: DAY28-S/DOCKER-BUILD
5. Click "Run workflow"

---

## 🔍 Troubleshooting

### Docker Build Fails
1. Check Dockerfile syntax: `docker build -t test .`
2. Verify all dependencies installed
3. Check environment variables

### AWS Login Fails
1. Verify AWS_ACCESS_KEY_ID in Secrets
2. Verify AWS_SECRET_ACCESS_KEY in Secrets
3. Verify AWS_REGION in Secrets
4. Check IAM permissions

### Image Push Fails
1. Verify AWS_ECR_REPOSITORY exists
2. Check ECR repository region matches AWS_REGION
3. Verify ECR repository is private (accessible)

---

## 📈 Performance

### Build Times
- First build: 5-10 minutes
- Subsequent builds: 2-3 minutes (cached layers)
- Cache invalidation: On package.json changes

### Image Size
- Uncompressed: 200-300 MB
- Compressed: 50-100 MB
- Deployment time: 30-60 seconds (ECS)

---

## 🎯 What's Next

1. **Configure Secrets** (3 min)
2. **Test Pipeline** (10 min)
3. **Verify in ECR** (5 min)
4. **Record Videos** (15-20 min)
5. **Create PR** (5 min)
6. **Submit** (1 min)

---

## 📚 Resources

- **Dockerfile**: `./Dockerfile`
- **Workflow**: `.github/workflows/ci.yml`
- **Documentation**: `DAY28_S_DOCKER_BUILD.md`
- **AWS ECR Docs**: https://docs.aws.amazon.com/ecr/
- **Docker Docs**: https://docs.docker.com/

---

**Status**: ✅ Ready for Configuration

**Next**: Setup AWS secrets → Test → Submit
