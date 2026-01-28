# DAY26-M: Docker Deployment on AWS ECS / Azure App Service

## Assignment Objectives
1. **Containerize Next.js application** using Docker with multi-stage builds
2. **Push to cloud registry** (AWS ECR or Azure ACR)
3. **Deploy to cloud container service** (AWS ECS/Fargate or Azure App Service)
4. **Configure CI/CD pipeline** with GitHub Actions
5. **Verify deployment** with screenshots and live URL
6. **Update documentation** with deployment procedures

---

## Part 1: Understanding Our Docker Setup

### Dockerfile Architecture (Multi-Stage Build)

Our Dockerfile uses 3 optimized stages:

```
Stage 1: deps          → Installs dependencies only (lightweight layer caching)
           ↓
Stage 2: builder       → Compiles Next.js application
           ↓
Stage 3: runner        → Final production image (minimal, secure)
```

#### **Stage 1: Dependencies Layer**
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
```
- Installs **production dependencies only** (no dev dependencies)
- Uses `npm ci` (Continuous Integration) for deterministic builds
- Alpine Linux (45MB base) vs Ubuntu (1.2GB) - massive size reduction
- Dependencies are cached if package.json hasn't changed

#### **Stage 2: Builder Layer**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```
- Installs **all dependencies** (production + development)
- Required for TypeScript compilation, Prisma generation, build optimization
- Builds Next.js standalone output in `.next` directory
- Not included in final image (keeps image small)

#### **Stage 3: Runner Layer** 
```dockerfile
FROM node:20-alpine AS runner
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["node", "server.js"]
```

**Key Security Features:**
- ✅ **Non-root user** (`nextjs:1001`) - prevents container escape attacks
- ✅ **Minimal final image** - only production code (reduces attack surface)
- ✅ **Health checks** - container orchestrator knows when app is unhealthy
- ✅ **Alpine Linux** - lightweight, fewer CVEs than larger distros
- ✅ **Standalone output** - Next.js doesn't require full framework in production

**Image Size Comparison:**
```
Full build with all dependencies: ~850MB
Multi-stage optimized:            ~280MB (67% reduction!)
```

---

## Part 2: Local Docker Development

### Building the Docker Image Locally

```bash
# Build the image with a tag
docker build -t sprintlite-app:latest .

# View the built image
docker images | grep sprintlite-app

# Expected output:
# sprintlite-app  latest  [IMAGE_ID]  [SIZE]  [AGE]
```

### Running with Docker Compose (Full Stack)

```bash
# Start all services (postgres, redis, app)
docker-compose up -d

# View running containers
docker-compose ps

# Check app logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

**What docker-compose.yml provides:**
- 🐘 **PostgreSQL 16-alpine** on port 5432
- 🔴 **Redis 7-alpine** on port 6379  
- 🚀 **Next.js App** on port 3000
- 🏥 **Health checks** on each service
- 📡 **Service discovery** via container names (app can connect to postgres:5432)

### Testing the Container

```bash
# 1. Check app is running
curl http://localhost:3000

# 2. Test API endpoint
curl http://localhost:3000/api/health

# 3. Check database connection
docker-compose exec app node -e "require('lib/db').testConnection()"

# 4. View container logs
docker-compose logs app

# 5. Execute command inside container
docker-compose exec app npx prisma db seed
```

---

## Part 3: AWS ECS Deployment

### Architecture Overview

```
GitHub Push
    ↓
GitHub Actions (CI/CD)
    ├─ Lint & Build
    ├─ Test
    ├─ Build Docker Image
    └─ Push to ECR
         ↓
    AWS ECR (Container Registry)
         ↓
    AWS ECS (Container Orchestration)
         ├─ Task Definition
         ├─ Service (Auto-scaling)
         └─ Load Balancer
         ↓
    Application on Fargate (Serverless Containers)
         ↓
    CloudWatch (Logs & Monitoring)
```

### Step 1: Create AWS ECR Repository

```bash
# Using AWS CLI
aws ecr create-repository \
  --repository-name sprintlite-app \
  --region us-east-1 \
  --image-tag-mutability MUTABLE \
  --encryption-configuration encryptionType=AES

# Response includes:
# "repositoryUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/sprintlite-app"
```

**Store this URI** - you'll need it for:
- GitHub Actions secrets
- ECS task definitions
- Image tagging

### Step 2: Configure GitHub Actions Secrets

Add these secrets to your GitHub repository (Settings → Secrets and Variables → Actions):

```
AWS_ACCESS_KEY_ID        → Your AWS access key
AWS_SECRET_ACCESS_KEY    → Your AWS secret key
AWS_REGION               → us-east-1
AWS_ECR_REGISTRY         → 123456789012.dkr.ecr.us-east-1.amazonaws.com
AWS_ECR_REPOSITORY       → sprintlite-app
AWS_ECS_SERVICE_NAME     → sprintlite-app-service
AWS_ECS_CLUSTER_NAME     → sprintlite-cluster
AWS_ECS_TASK_DEFINITION  → sprintlite-app-task
```

### Step 3: Create ECS Task Definition

The task definition tells ECS how to run your container:

```json
{
  "family": "sprintlite-app-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "sprintlite-app",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/sprintlite-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://app.example.com"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:sprintlite/db-url"
        },
        {
          "name": "SECRET_ARN",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:sprintlite/secrets"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sprintlite-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 40
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole"
}
```

**Key Components:**
- `networkMode: awsvpc` - Required for Fargate, auto-assigns ENI
- `cpu: 256, memory: 512` - Fargate valid combinations: 256MB-2GB CPU, 512MB-30GB memory
- `secrets` - Retrieves DATABASE_URL and SECRET_ARN from Secrets Manager at runtime
- `logConfiguration` - Sends container logs to CloudWatch
- `healthCheck` - ECS monitors app health; restarts if unhealthy

### Step 4: Create ECS Cluster

```bash
# Create Fargate cluster
aws ecs create-cluster \
  --cluster-name sprintlite-cluster \
  --region us-east-1 \
  --cluster-settings name=containerInsights,value=enabled

# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

### Step 5: Create ECS Service with Load Balancer

```bash
# First, create Application Load Balancer
aws elbv2 create-load-balancer \
  --name sprintlite-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678 \
  --scheme internet-facing

# Create target group
aws elbv2 create-target-group \
  --name sprintlite-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-12345678 \
  --health-check-protocol HTTP \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create ECS service (connect load balancer to cluster)
aws ecs create-service \
  --cluster sprintlite-cluster \
  --service-name sprintlite-app-service \
  --task-definition sprintlite-app-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678,subnet-87654321],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/sprintlite-tg/1234567890123456,containerName=sprintlite-app,containerPort=3000 \
  --deployment-configuration maximumPercent=200,minimumHealthyPercent=100
```

---

## Part 4: CI/CD Pipeline Configuration

### Updated GitHub Actions Workflow

Update `.github/workflows/ci.yml` to include ECR push and ECS deploy:

```yaml
# Add this to the docker-build job
docker-build:
  name: Build & Push Docker Image to ECR
  runs-on: ubuntu-latest
  needs: [lint, test-database]
  if: github.event_name == 'push'
  outputs:
    image: ${{ steps.image.outputs.image }}
  steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ secrets.AWS_REGION }}
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2
    
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: ${{ secrets.AWS_ECR_REPOSITORY }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    - name: Set image output
      id: image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: ${{ secrets.AWS_ECR_REPOSITORY }}
        IMAGE_TAG: ${{ github.sha }}
      run: echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

# Add new deploy-ecs job
deploy-ecs:
  name: Deploy to AWS ECS
  runs-on: ubuntu-latest
  needs: docker-build
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ secrets.AWS_REGION }}
    
    - name: Update ECS Task Definition
      id: task-def
      uses: aws-actions/amazon-ecs-render-task-definition@v1
      with:
        task-definition: task-definition.json
        container-name: sprintlite-app
        image: ${{ needs.docker-build.outputs.image }}
    
    - name: Deploy to ECS Service
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: ${{ steps.task-def.outputs.task-definition }}
        service: ${{ secrets.AWS_ECS_SERVICE_NAME }}
        cluster: ${{ secrets.AWS_ECS_CLUSTER_NAME }}
        wait-for-service-stability: true
```

---

## Part 5: Monitoring & Observability

### CloudWatch Logs

View container logs:
```bash
# Stream logs in real-time
aws logs tail /ecs/sprintlite-app --follow

# View specific time range
aws logs filter-log-events \
  --log-group-name /ecs/sprintlite-app \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --end-time $(date +%s)000
```

### ECS Monitoring Commands

```bash
# Check service status
aws ecs describe-services \
  --cluster sprintlite-cluster \
  --services sprintlite-app-service \
  --query 'services[0].[runningCount,desiredCount,deployments]'

# View task status
aws ecs list-tasks \
  --cluster sprintlite-cluster \
  --service-name sprintlite-app-service

# Describe specific task
aws ecs describe-tasks \
  --cluster sprintlite-cluster \
  --tasks arn:aws:ecs:us-east-1:123456789012:task/sprintlite-cluster/abcdef123456
```

### Auto-Scaling Configuration

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/sprintlite-cluster/sprintlite-app-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy (scale up when CPU > 70%)
aws application-autoscaling put-scaling-policy \
  --policy-name sprintlite-scale-up \
  --service-namespace ecs \
  --resource-id service/sprintlite-cluster/sprintlite-app-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleOutCooldown": 60,
    "ScaleInCooldown": 300
  }'
```

---

## Part 6: Troubleshooting

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Task fails to start | Image not found in ECR | Verify ECR repository URI in task definition |
| Service can't reach DB | Network/security group issue | Allow ECS subnet to access RDS security group |
| Health check failing | App not responding on /api/health | Verify endpoint exists and health check path is correct |
| Logs not appearing | CloudWatch IAM permissions | Ensure ecsTaskExecutionRole has `logs:*` permissions |
| OOM (Out of Memory) | Task memory too low | Increase memory in task definition |
| Secrets not loading | Incorrect secret ARN | Verify SECRET_ARN exists in Secrets Manager with correct permissions |

---

## Part 7: Verification Checklist

- [ ] Docker image builds locally: `docker build -t sprintlite-app:latest .`
- [ ] Docker Compose stack runs: `docker-compose up -d`
- [ ] Health check passes: `curl http://localhost:3000/api/health`
- [ ] ECR repository created with correct URI
- [ ] GitHub Actions secrets configured
- [ ] Task definition registered successfully
- [ ] ECS cluster created with Fargate capacity
- [ ] ECS service deployed with 2+ tasks
- [ ] Load balancer health checks are passing
- [ ] Application accessible via load balancer URL
- [ ] CloudWatch logs receiving data
- [ ] Database migrations applied successfully
- [ ] Secrets Manager values retrieving correctly at runtime
- [ ] Auto-scaling policies configured
- [ ] CI/CD pipeline automatically deploys on main branch push

---

## Part 8: Security Best Practices

✅ **Implemented:**
- Non-root user (nextjs:1001) in container
- Multi-stage build reduces attack surface
- Alpine Linux minimizes CVEs
- Health checks ensure only healthy containers serve traffic
- Secrets from AWS Secrets Manager (not in env files)
- Network mode awsvpc for ECS security group control
- CloudWatch logging for audit trail

⚠️ **Consider for Enhancement:**
- WAF (Web Application Firewall) on ALB
- VPC endpoints for ECR and Secrets Manager (no internet gateway needed)
- KMS encryption for ECR images
- Container image scanning for vulnerabilities
- VPC isolation for RDS and Redis
- TLS/HTTPS on ALB listener
- IAM role least-privilege review

---

## References

- [AWS ECS Fargate Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-cpu-memory-error.html)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Next.js Standalone Output](https://nextjs.org/docs/pages/api-reference/next-config-js/output)
- [Alpine Linux vs Other Base Images](https://docs.docker.com/build/building/best-practices/)
- [AWS ECS Task Definition Reference](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html)

---

## Reflection & Key Learnings

### Why Multi-Stage Builds?

Traditional approaches build one monolithic image with all dependencies. Our approach:
1. **Stage 1 (deps)** - Prod dependencies cached separately
2. **Stage 2 (builder)** - Dev dependencies + compilation (temporary)
3. **Stage 3 (runner)** - Only code needed to run the app

Result: **67% size reduction** (850MB → 280MB), faster deployments, faster startup times.

### Why Fargate vs EC2?

- **No infrastructure to manage** - AWS handles OS patching, security updates
- **Pay only for CPU/memory used** - No idle EC2 instance costs
- **Automatic scaling** - Scale tasks independently
- **Simpler security model** - No SSH access needed, IAM roles handle permissions

### Why Secrets Manager vs Environment Variables?

- **Dynamic rotation** - Change secrets without redeploying
- **Audit trail** - CloudTrail logs all secret access
- **Encryption at rest** - KMS encryption for sensitive data
- **Fine-grained permissions** - IAM policies control which containers access which secrets

