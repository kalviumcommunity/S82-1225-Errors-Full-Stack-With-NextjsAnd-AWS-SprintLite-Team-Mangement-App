# SprintLite - Cloud Deployment Guide

## Quick Start: Deploy to AWS

### Option 1: AWS Elastic Container Service (ECS) - Recommended

#### Prerequisites
- AWS Account
- AWS CLI installed
- Docker installed locally

#### Steps

**1. Push Docker Image to Amazon ECR**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name sprintlite

# Build and tag image
docker build -t sprintlite:latest .
docker tag sprintlite:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/sprintlite:latest

# Push to ECR
docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/sprintlite:latest
```

**2. Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name sprintlite-cluster
```

**3. Create Task Definition**
Create `task-definition.json`:
```json
{
  "family": "sprintlite",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "sprintlite-app",
      "image": "<your-account-id>.dkr.ecr.us-east-1.amazonaws.com/sprintlite:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "your-database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sprintlite",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register the task:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

**4. Create Service**
```bash
aws ecs create-service \
  --cluster sprintlite-cluster \
  --service-name sprintlite-service \
  --task-definition sprintlite \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

**5. Set Up Application Load Balancer (Optional)**
- Create ALB in AWS Console
- Add target group pointing to ECS service
- Configure health checks on `/api/health`

---

### Option 2: AWS EC2 with Docker

**1. Launch EC2 Instance**
```bash
# Ubuntu 22.04 LTS, t3.small or larger
# Ensure security group allows port 3000
```

**2. Connect and Install Docker**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
```

**3. Clone Repository**
```bash
git clone https://github.com/yourusername/sprintlite.git
cd sprintlite
```

**4. Set Environment Variables**
```bash
nano .env.production
# Add DATABASE_URL, REDIS_URL, etc.
```

**5. Start with Docker Compose**
```bash
docker-compose up -d
```

**6. Set Up Nginx Reverse Proxy**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/sprintlite

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo ln -s /etc/nginx/sites-available/sprintlite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. Set Up SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Quick Start: Deploy to Azure

### Option 1: Azure Container Apps - Recommended

**1. Install Azure CLI**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

**2. Create Resource Group**
```bash
az group create --name sprintlite-rg --location eastus
```

**3. Create Container Registry**
```bash
az acr create --resource-group sprintlite-rg --name sprintliteacr --sku Basic
az acr login --name sprintliteacr
```

**4. Build and Push Image**
```bash
docker build -t sprintlite:latest .
docker tag sprintlite:latest sprintliteacr.azurecr.io/sprintlite:latest
docker push sprintliteacr.azurecr.io/sprintlite:latest
```

**5. Create Container App Environment**
```bash
az containerapp env create \
  --name sprintlite-env \
  --resource-group sprintlite-rg \
  --location eastus
```

**6. Deploy Container App**
```bash
az containerapp create \
  --name sprintlite-app \
  --resource-group sprintlite-rg \
  --environment sprintlite-env \
  --image sprintliteacr.azurecr.io/sprintlite:latest \
  --target-port 3000 \
  --ingress 'external' \
  --registry-server sprintliteacr.azurecr.io \
  --env-vars \
    NODE_ENV=production \
    DATABASE_URL=your-database-url
```

**7. Get App URL**
```bash
az containerapp show \
  --name sprintlite-app \
  --resource-group sprintlite-rg \
  --query properties.configuration.ingress.fqdn
```

---

### Option 2: Azure App Service (Containers)

**1. Create App Service Plan**
```bash
az appservice plan create \
  --name sprintlite-plan \
  --resource-group sprintlite-rg \
  --is-linux \
  --sku B1
```

**2. Create Web App**
```bash
az webapp create \
  --resource-group sprintlite-rg \
  --plan sprintlite-plan \
  --name sprintlite-webapp \
  --deployment-container-image-name sprintliteacr.azurecr.io/sprintlite:latest
```

**3. Configure Environment Variables**
```bash
az webapp config appsettings set \
  --resource-group sprintlite-rg \
  --name sprintlite-webapp \
  --settings \
    NODE_ENV=production \
    DATABASE_URL=your-database-url \
    WEBSITES_PORT=3000
```

**4. Enable Continuous Deployment**
```bash
az webapp deployment container config \
  --name sprintlite-webapp \
  --resource-group sprintlite-rg \
  --enable-cd true
```

---

## Database Setup

### AWS RDS (PostgreSQL)
```bash
aws rds create-db-instance \
  --db-instance-identifier sprintlite-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <your-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxx
```

### Azure Database for PostgreSQL
```bash
az postgres server create \
  --resource-group sprintlite-rg \
  --name sprintlite-db \
  --location eastus \
  --admin-user adminuser \
  --admin-password <your-password> \
  --sku-name B_Gen5_1
```

---

## Monitoring & Logging

### AWS CloudWatch
```bash
# Logs automatically sent from ECS
# View in CloudWatch Console
```

### Azure Application Insights
```bash
az monitor app-insights component create \
  --app sprintlite-insights \
  --location eastus \
  --resource-group sprintlite-rg
```

---

## CI/CD Integration

Update `.github/workflows/ci.yml` to deploy automatically:

**For AWS:**
```yaml
- name: Deploy to AWS ECS
  run: |
    aws ecs update-service \
      --cluster sprintlite-cluster \
      --service sprintlite-service \
      --force-new-deployment
```

**For Azure:**
```yaml
- name: Deploy to Azure Container App
  run: |
    az containerapp update \
      --name sprintlite-app \
      --resource-group sprintlite-rg \
      --image sprintliteacr.azurecr.io/sprintlite:${{ github.sha }}
```

---

## Cost Estimates (Monthly)

### AWS
- ECS Fargate (2 tasks): ~$30
- RDS t3.micro: ~$15
- Application Load Balancer: ~$20
- **Total: ~$65/month**

### Azure
- Container App (Basic): ~$25
- PostgreSQL Basic: ~$25
- **Total: ~$50/month**

### Free Tier Options
- **Vercel:** Free for personal projects
- **Railway:** $5 starter plan
- **Render:** Free tier available

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs <container-id>

# Verify environment variables
docker exec -it <container-id> env
```

### Database Connection Issues
```bash
# Test from container
docker exec -it <container-id> sh
npm run test:db
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
kill -9 <PID>
```

---

## Security Checklist

- ✅ Use HTTPS/SSL certificates
- ✅ Store secrets in environment variables
- ✅ Enable firewall rules (only port 80/443)
- ✅ Regular security updates
- ✅ Use non-root user in container
- ✅ Enable database encryption
- ✅ Set up backup strategy

---

## Next Steps

1. Choose deployment platform (AWS/Azure)
2. Set up database and Redis
3. Push Docker image to registry
4. Deploy container
5. Configure domain and SSL
6. Set up monitoring
7. Configure automated backups
8. Document runbook for team

---

**Need Help?** Check AWS/Azure documentation or reach out to the team!
