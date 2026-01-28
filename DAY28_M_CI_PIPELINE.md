# GitHub Actions CI Pipeline (DAY28-M)

## 📋 Overview

This document explains the **GitHub Actions CI/CD Pipeline** configured for the SprintLite application. The pipeline automates code quality checks, testing, building, and deployment to ensure every change is verified before production.

## 🎯 Pipeline Architecture

### Four Core Stages

```
┌─────────────────────────────────────────────────────────────┐
│                    CI PIPELINE FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STAGE 1: LINT              [Check Code Quality]           │
│  └─ ESLint                                                  │
│  └─ TypeScript Compilation                                 │
│           ⬇                                                 │
│  STAGE 2: TEST              [Run Tests]                    │
│  ├─ Unit Tests (Jest)                                       │
│  ├─ Integration Tests (__tests__/api)                       │
│  ├─ Coverage Report                                         │
│  └─ PR Comment with Results                                 │
│           ⬇                                                 │
│  STAGE 3: BUILD             [Compile Application]          │
│  ├─ Next.js Build                                           │
│  ├─ Artifact Upload                                         │
│  └─ Build Cache                                             │
│           ⬇                                                 │
│  STAGE 4: DATABASE TEST     [Verify DB Connection]         │
│  ├─ Prisma Client Generation                                │
│  └─ Schema Validation                                       │
│           ⬇                                                 │
│  STAGE 5: DOCKER BUILD      [Build & Push Image]           │
│  ├─ AWS ECR Login                                           │
│  └─ Docker Image Push                                       │
│           ⬇                                                 │
│  STAGE 6: DEPLOY            [Deploy to Production]         │
│  ├─ Deploy to Development/Staging/Production                │
│  ├─ ECS Deployment                                          │
│  └─ Service Verification                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Workflow File Location

**Path**: `.github/workflows/ci.yml`

This file is the core configuration that defines:
- When the pipeline runs (on push, PR, etc.)
- What jobs execute and in what order
- Environment variables and secrets
- Caching strategies

## 🔧 Stage Details

### Stage 1: LINT (Code Quality Check)

**Purpose**: Ensure code follows standards and compiles correctly

**Steps**:
1. Checkout repository
2. Setup Node.js
3. Install dependencies
4. Run ESLint - Check for code style violations
5. TypeScript Check - Verify no type errors

**Configuration**:
```yaml
lint:
  name: Lint & Type Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    - run: npm ci
    - run: npm run lint
    - run: npx tsc --noEmit
```

**Exit Condition**: ❌ Fails if ESLint or TypeScript check fails

---

### Stage 2: TEST (Unit & Integration Tests)

**Purpose**: Validate all functionality works correctly

**What's Tested**:
- ✅ Unit tests (Jest) - Individual functions and components
- ✅ Integration tests (__tests__/api) - API interactions
- ✅ Coverage reporting - Code coverage metrics
- ✅ PR comments - Results posted to PRs

**Configuration**:
```yaml
test:
  name: Test Suite
  runs-on: ubuntu-latest
  needs: lint
  timeout-minutes: 20
  strategy:
    matrix:
      node-version: [20.x, 22.x]  # Test multiple Node versions
```

**Matrix Testing**:
- Runs tests on both Node 20.x and 22.x
- Ensures compatibility across versions
- Creates separate artifacts for each version

**Coverage Report**:
```javascript
{
  "statements": 85%,
  "branches": 80%,
  "functions": 90%,
  "lines": 85%
}
```

**PR Comment Example**:
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

---

### Stage 3: BUILD (Compile Application)

**Purpose**: Ensure application builds without errors

**What's Built**:
- Next.js application
- Generate .next directory
- Optimize assets
- Bundle JavaScript/CSS

**Configuration**:
```yaml
build:
  name: Build Application
  runs-on: ubuntu-latest
  needs: [lint, test-database]
  strategy:
    matrix:
      environment: [development, staging, production]
```

**Build for Multiple Environments**:
- Builds for dev, staging, and production
- Uses environment-specific secrets
- Stores artifacts for deployment

**Artifacts Uploaded**:
- Path: `.next/` directory
- Retention: 7 days
- Size: Typically 50-200MB

---

### Stage 4: DATABASE TEST (Verify Database)

**Purpose**: Ensure database schema is valid

**Steps**:
1. Generate Prisma Client
2. Validate schema
3. Test database connection (if configured)

**Configuration**:
```yaml
test-database:
  name: Test Database Connection
  runs-on: ubuntu-latest
  needs: test
  steps:
    - run: npm run db:generate
    - run: npx prisma validate
```

---

### Stage 5: DOCKER BUILD (Docker Image)

**Purpose**: Build and push Docker image to AWS ECR

**Requirements**:
- AWS credentials (secrets)
- ECR repository name
- Docker installed on runner

**Configuration**:
```yaml
docker-build:
  name: Build & Push Docker Image
  runs-on: ubuntu-latest
  needs: [lint, test-database]
  if: github.event_name == 'push'
```

**Steps**:
1. Configure AWS credentials
2. Login to ECR
3. Build Docker image
4. Tag with git SHA + latest
5. Push to ECR

**Example Output**:
```
ECR_REGISTRY/sprintlite:a1b2c3d (git SHA)
ECR_REGISTRY/sprintlite:latest
```

---

### Stage 6: DEPLOY (Deployment)

**Deployment Scenarios**:

#### To Development
- **Trigger**: Push to `develop` branch
- **Environment**: Development server
- **Action**: Download build, deploy

#### To Staging
- **Trigger**: Push to `staging` branch
- **Environment**: Staging server
- **Action**: Download build, deploy

#### To Production (ECS)
- **Trigger**: Push to `main` branch
- **Environment**: AWS ECS/Fargate
- **Steps**:
  1. Configure AWS credentials
  2. Download ECS task definition
  3. Update with new Docker image
  4. Deploy to ECS service
  5. Wait for stability
  6. Verify running tasks

**Configuration**:
```yaml
deploy-ecs:
  name: Deploy to AWS ECS/Fargate
  runs-on: ubuntu-latest
  needs: docker-build
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  environment:
    name: ecs-production
    url: ${{ secrets.ECS_SERVICE_URL }}
```

---

## 🚀 Pipeline Triggers

### Automatic Triggers

| Trigger | Branches | Action |
|---------|----------|--------|
| **Push** | main, develop, staging, DAY28-M/CI-PIPELINE | Run full pipeline |
| **Pull Request** | main, develop, staging, DAY28-M/CI-PIPELINE | Run lint, test, build |
| **Workflow Dispatch** | Any | Manual trigger from Actions tab |

### Example Flows

```
1. Developer pushes to feature branch
   └─ No pipeline runs (not configured branch)

2. Developer opens PR to develop
   └─ Lint → Test → Build (no deploy)

3. Developer pushes to develop
   └─ Lint → Test → Build → Deploy to Development

4. Developer merges to main
   └─ Lint → Test → Build → Docker Build → Deploy to Production
```

---

## 🔐 Secrets & Environment Variables

### Required Secrets

Create these in **Settings → Secrets and Variables → Actions**:

```
# Database
DATABASE_URL_development
DATABASE_URL_staging
DATABASE_URL_production

# AWS
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# AWS ECR
AWS_ECR_REPOSITORY

# AWS ECS
AWS_ECS_TASK_DEFINITION
AWS_ECS_SERVICE_NAME
AWS_ECS_CLUSTER_NAME

# URLs
DEV_URL
STAGING_URL
PROD_URL
ECS_SERVICE_URL
```

### Using Secrets in Workflow

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL_production }}
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
```

### Best Practices

✅ **DO**:
- Store sensitive data in Secrets
- Rotate credentials regularly
- Use environment-specific secrets
- Never log secret values
- Use OIDC for AWS (instead of access keys)

❌ **DON'T**:
- Commit secrets to repository
- Hardcode credentials in YAML
- Log secret values in console
- Share secrets in messages/emails

---

## ⚡ Performance Optimization

### 1. Caching (Speeds up Dependencies)

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20.x
    cache: 'npm'  # ← Caches node_modules
```

**Benefits**:
- ✅ Skip downloading node_modules every run
- ✅ Cache hit: ~30 seconds vs miss: ~2-3 minutes
- ✅ Automatic cache invalidation on package.json change

### 2. Concurrency (Prevents Duplicate Runs)

```yaml
concurrency:
  group: ${{ github.ref }}
  cancel-in-progress: true
```

**Benefits**:
- ✅ Only one pipeline per branch at a time
- ✅ Cancel previous run if new push happens
- ✅ Saves CI minutes and resources

### 3. Job Dependencies (Parallel Execution)

```yaml
build:
  needs: [lint, test-database]  # Both run in parallel
```

**Benefits**:
- ✅ Run independent jobs in parallel
- ✅ Reduces total pipeline time
- ✅ Logical ordering maintained

### 4. Matrix Strategy (Maximize Coverage)

```yaml
strategy:
  matrix:
    node-version: [20.x, 22.x]
    environment: [development, staging, production]
```

**Benefits**:
- ✅ Test multiple configurations
- ✅ Run in parallel automatically
- ✅ Catch environment-specific bugs

### 5. Timeouts (Prevent Hung Jobs)

```yaml
timeout-minutes: 20  # Fail after 20 minutes
```

**Benefits**:
- ✅ Prevent stuck pipelines
- ✅ Free up resources
- ✅ Alert to performance issues

---

## 📊 Workflow Execution Example

### Timeline of a Successful Push to Main

```
00:00 - Workflow triggered (push to main)
00:05 - Lint job starts
00:15 - Lint completes ✅
00:15 - Test job starts (waits for lint)
00:25 - Test completes ✅ + PR comment posted
00:25 - Database test & build start (parallel)
00:45 - Database test completes ✅
00:50 - Build completes ✅
00:50 - Docker build starts
01:10 - Docker build completes ✅
01:10 - Deploy to Production starts
01:30 - Deploy completes ✅
01:30 - Entire pipeline completes! 🎉

Total Time: ~1 minute 30 seconds
```

---

## 🔍 Viewing Pipeline Results

### In GitHub UI

1. Go to **Actions** tab
2. Click on workflow run
3. See:
   - ✅/❌ Status of each job
   - Execution time
   - Logs for each step
   - Artifacts uploaded

### In Console

```
Run npm ci
  npm notice 
  npm WARN deprecated <package>
  added 245 packages in 2.5s

Run npm run lint
  yarn run v1.22.10
  $ eslint . --ext .js,.jsx,.ts,.tsx
  ✓ No linting errors

Run npm test -- --coverage
  PASS  __tests__/validation.test.js
  PASS  __tests__/Button.test.jsx
  PASS  __tests__/api/auth.integration.test.js
  
  Test Suites: 3 passed, 3 total
  Tests:       24 passed, 24 total
  ✓ Coverage thresholds met
```

---

## 🐛 Debugging Pipeline Failures

### Common Issues & Solutions

#### Issue 1: Lint Failures
```
❌ Run ESLint
  error  Unexpected var keyword  no-var
```
**Solution**: Fix linting errors locally with `npm run lint`

#### Issue 2: Test Failures
```
❌ Run Unit Tests
  ● failing test
  Expected: true
  Received: false
```
**Solution**: 
- Check test logs for details
- Run locally: `npm test`
- Fix code and push again

#### Issue 3: Build Failure
```
❌ Build Next.js App
  TypeError: Cannot read property 'x' of undefined
```
**Solution**:
- Check environment variables
- Verify all secrets are set
- Run locally: `npm run build`

#### Issue 4: Cache Issues
```
❌ Package installation slow
```
**Solution**:
- Check if cache is enabled in workflow
- Clear cache in Actions settings if stuck

#### Issue 5: Deployment Failure
```
❌ Deploy to Production
  Error: Access Denied
```
**Solution**:
- Verify AWS credentials in Secrets
- Check IAM permissions
- Validate role has required policies

### Debug Steps

1. **Check the full log**: Click on failing step
2. **Look for error messages**: Usually at the end
3. **Reproduce locally**: Run same command on your machine
4. **Check environment variables**: Verify secrets are set
5. **Ask in PR**: Post question with log snippet

---

## 📈 Monitoring & Analytics

### Pipeline Health Metrics

Track in GitHub:
- **Success Rate**: % of runs that pass
- **Average Duration**: Total pipeline time
- **Failed Jobs**: Which stages fail most
- **Flaky Tests**: Tests that sometimes fail

### Example Dashboard

```
Last 30 Days:
✅ Successful runs: 45/50 (90%)
❌ Failed runs: 5/50 (10%)

Avg Duration: 2m 15s
Fastest run: 1m 30s
Slowest run: 5m 45s

Most common failures:
1. Database connection (3 times)
2. Test flakiness (2 times)
```

---

## 🎓 Key Takeaways

### Benefits of CI Pipeline

1. **Automated Verification**: Every change is tested before merge
2. **Early Bug Detection**: Catch issues in staging before production
3. **Consistency**: Same process for every team member
4. **Speed**: Parallel jobs reduce overall time
5. **Confidence**: Deploy with assurance everything works
6. **Audit Trail**: Complete history of builds/deployments

### Best Practices

✅ **Keep pipelines fast**: Aim for < 5 minutes
✅ **Cache aggressively**: Reuse build artifacts
✅ **Test thoroughly**: Unit + integration + E2E
✅ **Secure secrets**: Never commit credentials
✅ **Monitor health**: Track success rates
✅ **Document failures**: Make logs searchable
✅ **Optimize in steps**: Build fast → test fast → deploy fast

---

## 🔗 Related Files

- **Workflow**: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- **Package.json**: [package.json](package.json) (contains lint, test, build scripts)
- **Jest Config**: [jest.config.js](jest.config.js)
- **ESLint Config**: [eslint.config.mjs](eslint.config.mjs)
- **GitHub Docs**: https://docs.github.com/en/actions

---

## 📝 Screenshots Checklist

- [ ] Screenshot of workflow YAML file
- [ ] Screenshot of successful run in Actions tab
- [ ] Screenshot of job execution timeline
- [ ] Screenshot of PR comment with test results
- [ ] Screenshot of coverage report
- [ ] Screenshot of deployment logs

---

## 🎯 Next Steps

1. **Review workflow**: Check `.github/workflows/ci.yml`
2. **Verify secrets**: Confirm all GitHub secrets are set
3. **Test locally**: Run `npm run lint`, `npm test`, `npm run build`
4. **Push test**: Create a PR and watch pipeline execute
5. **Monitor results**: View Actions tab for results
6. **Optimize**: Reduce pipeline duration over time

---

**Status**: ✅ CI Pipeline Configured and Ready

**Last Updated**: January 28, 2026
**Next**: Configure deployment credentials and test end-to-end flow
