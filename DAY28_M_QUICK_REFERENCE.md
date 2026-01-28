# DAY28-M: CI Pipeline - Quick Reference

## ✅ What We Have

### Workflow File
✅ **Location**: `.github/workflows/ci.yml`
✅ **Stages**: 6 stages (Lint → Test → Build → DB Test → Docker → Deploy)
✅ **Triggers**: Push, PR, Manual dispatch
✅ **Concurrency**: Enabled (prevents duplicate runs)
✅ **Caching**: Enabled (speeds up builds)

### Scripts in package.json
✅ `npm run lint` - ESLint check
✅ `npm test` - Run Jest tests
✅ `npm run test:coverage` - Coverage report
✅ `npm run build` - Next.js build
✅ `npm run db:generate` - Prisma client

### Test Coverage
✅ Unit tests (Jest)
✅ Integration tests (__tests__/api)
✅ Database tests (Prisma validation)
✅ Build verification (Next.js compilation)

---

## 🚀 Pipeline Stages

### Stage 1: LINT (2-3 min)
```
✓ Checkout code
✓ Setup Node
✓ ESLint check
✓ TypeScript verification
```
**Fails if**: Code style issues or type errors

### Stage 2: TEST (5-10 min)
```
✓ Run tests on Node 20.x
✓ Run tests on Node 22.x
✓ Generate coverage report
✓ Post results to PR
```
**Fails if**: Any test fails or timeout

### Stage 3: BUILD (5-10 min)
```
✓ Build for development
✓ Build for staging
✓ Build for production
✓ Upload artifacts
```
**Fails if**: Build compilation error

### Stage 4: DB TEST (2-3 min)
```
✓ Generate Prisma client
✓ Validate schema
```
**Fails if**: Schema is invalid

### Stage 5: DOCKER (5-10 min)
```
✓ Build Docker image
✓ Push to AWS ECR
✓ Tag with git SHA + latest
```
**Fails if**: AWS credentials invalid or build error

### Stage 6: DEPLOY (5-15 min)
```
✓ Download task definition
✓ Update with new image
✓ Deploy to ECS
✓ Wait for stability
```
**Fails if**: Deployment error or service instability

---

## 📊 Pipeline Execution Timeline

```
Total Time: ~30-50 minutes (full pipeline)
PR Validation Time: ~10-15 minutes (no deploy)

Parallel Execution:
├─ Lint: 2-3 min
├─ Test (2 versions): 5-10 min
├─ Build (3 environments): 5-10 min
├─ DB Test: 2-3 min
└─ Docker & Deploy: 10-20 min

Critical Path: Lint → Test → Build → Deploy
```

---

## 🔐 Required Secrets

**GitHub Settings → Secrets and Variables → Actions**

### Database
```
DATABASE_URL_development
DATABASE_URL_staging
DATABASE_URL_production
```

### AWS
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_ECR_REPOSITORY
AWS_ECS_TASK_DEFINITION
AWS_ECS_SERVICE_NAME
AWS_ECS_CLUSTER_NAME
```

### URLs
```
DEV_URL
STAGING_URL
PROD_URL
ECS_SERVICE_URL
```

---

## 🎯 Triggers & Flows

### Push to develop
```
Lint → Test → Build → DB Test → Deploy to Development
```

### Push to staging
```
Lint → Test → Build → DB Test → Deploy to Staging
```

### Push to main
```
Lint → Test → Build → DB Test → Docker Build → Deploy to Production
```

### Pull Request to any
```
Lint → Test → Build (no deploy)
+ PR comment with test results
```

---

## ✨ Key Features

### ⚡ Performance Optimizations
✅ npm cache - Reuse node_modules
✅ Concurrency - One pipeline per branch
✅ Parallel jobs - Test multiple Node versions
✅ Artifact caching - Reuse build artifacts

### 🔐 Security
✅ GitHub Secrets for credentials
✅ Environment-specific secrets
✅ No hardcoded credentials
✅ AWS IAM roles (if using OIDC)

### 📊 Monitoring
✅ PR comments with test results
✅ Coverage reports as artifacts
✅ Detailed execution logs
✅ Deployment verification

### 🧪 Testing
✅ Unit tests (Jest)
✅ Integration tests (__tests__/api)
✅ Multiple Node versions
✅ Coverage metrics

---

## 🔍 Viewing Results

### GitHub Actions Tab
1. Go to **Actions** tab in GitHub
2. Click on workflow run
3. See status of each job
4. Click job to see detailed logs
5. Check artifacts tab for reports

### PR Comments
Test results automatically posted to PRs:
```
## ✅ Test Results

**Node Version**: 20.x

### Coverage Metrics
- Statements: 85%
- Branches: 80%
- Functions: 90%
- Lines: 85%

✅ All tests passed successfully!
```

### Local Testing
Before pushing:
```bash
npm run lint          # Check code style
npm test              # Run tests locally
npm run build         # Build locally
npm run test:coverage # See coverage
```

---

## 🛠️ Debugging Failures

### Pipeline fails on lint
```bash
# Fix locally
npm run lint

# Look for errors
# Fix code and commit
git add .
git commit -m "Fix linting errors"
git push
```

### Pipeline fails on test
```bash
# Run tests locally
npm test

# Run specific test
npm test -- __tests__/api

# Debug in watch mode
npm run test:watch

# Check coverage
npm run test:coverage
```

### Pipeline fails on build
```bash
# Build locally
npm run build

# Check for errors in logs
# Verify environment variables
# Check Node version compatibility
```

### Pipeline fails on deploy
```bash
# Check GitHub secrets are set
# Verify AWS credentials have correct permissions
# Check if ECS service exists
# Verify database is accessible
```

---

## 📈 Pipeline Health Checks

### Check Success Rate
1. Go to Actions tab
2. Look at recent workflow runs
3. Count passes vs failures

### Monitor Execution Time
1. Check individual job durations
2. Look for performance bottlenecks
3. Identify slowest stages

### Review Logs
1. Click on failed step
2. Look for error messages
3. Check if secrets are properly set

---

## 🚀 Deployment Flow

### For Development
```
1. Create branch: git checkout -b feature/...
2. Make changes and commit
3. Push: git push origin feature/...
4. Create PR to develop
   └─ Pipeline runs: Lint → Test → Build
5. Merge PR to develop
   └─ Pipeline runs: ... → Deploy to Development
```

### For Production
```
1. Create PR to main
   └─ Pipeline runs: Lint → Test → Build
2. Review & approve PR
3. Merge to main
   └─ Pipeline runs: ... → Docker → Deploy to Production
4. Monitor deployment in Actions tab
5. Verify on production URL
```

---

## 💡 Best Practices

✅ Keep pipeline < 5 minutes
✅ Fix failing pipelines immediately
✅ Use meaningful commit messages
✅ Test locally before pushing
✅ Review logs for warnings
✅ Keep secrets rotated
✅ Monitor pipeline health

❌ Don't ignore pipeline failures
❌ Don't hardcode credentials
❌ Don't skip testing
❌ Don't merge failing PRs
❌ Don't run manual deployments

---

## 🎓 Commands Reference

```bash
# Local validation
npm run lint                # Check code style
npm test                    # Run tests
npm run test:coverage       # Coverage report
npm run build               # Build app
npm run db:generate         # Prisma client
npx tsc --noEmit           # Type check

# Git commands
git checkout -b DAY28-M/CI-PIPELINE
git add .
git commit -m "DAY28-M: CI Pipeline setup"
git push origin DAY28-M/CI-PIPELINE

# View pipeline
# Go to GitHub → Actions tab → Select workflow
```

---

## 📋 Checklist

- [x] Workflow file created (.github/workflows/ci.yml)
- [x] All 4 stages configured (Lint, Test, Build, Deploy)
- [x] Scripts in package.json
- [x] Caching and concurrency enabled
- [x] GitHub secrets ready to configure
- [x] Documentation complete
- [ ] Secrets configured (AWS, Database, etc.)
- [ ] Test push to trigger pipeline
- [ ] Verify PR comment integration
- [ ] Screenshot of successful run

---

## 📚 Resources

- **Workflow File**: `.github/workflows/ci.yml`
- **Documentation**: `DAY28_M_CI_PIPELINE.md`
- **GitHub Docs**: https://docs.github.com/en/actions
- **npm Scripts**: `package.json`

---

**Status**: ✅ CI Pipeline Ready to Use

**Next**: 
1. Configure GitHub secrets
2. Push test commit to trigger pipeline
3. Verify all stages pass
4. Create PR and verify comments
5. Record demo video
