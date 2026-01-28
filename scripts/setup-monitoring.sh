#!/bin/bash

# ============================================================================
# AWS CloudWatch Logging & Monitoring Setup Script
# ============================================================================
# This script sets up:
# 1. CloudWatch Log Groups
# 2. Metric Filters (for error/warning counting)
# 3. CloudWatch Dashboards
# 4. CloudWatch Alarms (CPU, errors, latency)
# ============================================================================

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
LOG_GROUP="/ecs/sprintlite-app"
DASHBOARD_NAME="sprintlite-app-dashboard"
ALARM_PREFIX="sprintlite-app"
LOG_RETENTION_DAYS=7

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}CloudWatch Logging & Monitoring Setup${NC}"
echo -e "${BLUE}================================================${NC}\n"

# ============================================================================
# Step 1: Create CloudWatch Log Group
# ============================================================================
echo -e "${YELLOW}[Step 1] Creating CloudWatch Log Group...${NC}"

aws logs describe-log-groups \
  --region "$AWS_REGION" \
  --log-group-name-prefix "$LOG_GROUP" \
  --query "logGroups[?logGroupName=='$LOG_GROUP']" \
  --output text > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Log group already exists: $LOG_GROUP${NC}"
else
  aws logs create-log-group \
    --log-group-name "$LOG_GROUP" \
    --region "$AWS_REGION"
  
  echo -e "${GREEN}✅ Created log group: $LOG_GROUP${NC}"
fi

# Set retention policy
aws logs put-retention-policy \
  --log-group-name "$LOG_GROUP" \
  --retention-in-days $LOG_RETENTION_DAYS \
  --region "$AWS_REGION"

echo -e "${GREEN}✅ Set log retention to $LOG_RETENTION_DAYS days${NC}\n"

# ============================================================================
# Step 2: Create Metric Filters
# ============================================================================
echo -e "${YELLOW}[Step 2] Creating Metric Filters...${NC}"

# Filter 1: Error Count
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP" \
  --filter-name "ErrorCount" \
  --filter-pattern '{ $.level = "error" }' \
  --metric-transformations metricName="ErrorCount",metricNamespace="sprintlite-app",metricValue="1",defaultValue=0 \
  --region "$AWS_REGION" 2>/dev/null || true

echo -e "${GREEN}✅ Created metric filter: ErrorCount ($.level = \"error\")${NC}"

# Filter 2: Warning Count
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP" \
  --filter-name "WarningCount" \
  --filter-pattern '{ $.level = "warn" }' \
  --metric-transformations metricName="WarningCount",metricNamespace="sprintlite-app",metricValue="1",defaultValue=0 \
  --region "$AWS_REGION" 2>/dev/null || true

echo -e "${GREEN}✅ Created metric filter: WarningCount ($.level = \"warn\")${NC}"

# Filter 3: API Error (4xx and 5xx)
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP" \
  --filter-name "HttpErrorCount" \
  --filter-pattern '{ $.statusCode >= 400 }' \
  --metric-transformations metricName="HttpErrorCount",metricNamespace="sprintlite-app",metricValue="1",defaultValue=0 \
  --region "$AWS_REGION" 2>/dev/null || true

echo -e "${GREEN}✅ Created metric filter: HttpErrorCount (statusCode >= 400)${NC}"

# Filter 4: Slow API Requests (>1000ms)
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP" \
  --filter-name "SlowApiRequests" \
  --filter-pattern '{ $.duration > 1000 }' \
  --metric-transformations metricName="SlowApiRequests",metricNamespace="sprintlite-app",metricValue="1",defaultValue=0 \
  --region "$AWS_REGION" 2>/dev/null || true

echo -e "${GREEN}✅ Created metric filter: SlowApiRequests (duration > 1000ms)${NC}\n"

# ============================================================================
# Step 3: Create CloudWatch Dashboard
# ============================================================================
echo -e "${YELLOW}[Step 3] Creating CloudWatch Dashboard...${NC}"

# Get ECS cluster and service info (user input or defaults)
read -p "Enter your ECS Cluster name (default: sprintlite-cluster): " ECS_CLUSTER
ECS_CLUSTER=${ECS_CLUSTER:-sprintlite-cluster}

read -p "Enter your ECS Service name (default: sprintlite-app-service): " ECS_SERVICE
ECS_SERVICE=${ECS_SERVICE:-sprintlite-app-service}

# Create dashboard definition
cat > /tmp/dashboard-body.json <<EOF
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "sprintlite-app", "ErrorCount", { "stat": "Sum", "period": 300 } ],
          [ ".", "WarningCount", { "stat": "Sum", "period": 300 } ],
          [ ".", "HttpErrorCount", { "stat": "Sum", "period": 300 } ]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "$AWS_REGION",
        "title": "Error & Warning Metrics",
        "yAxis": { "left": { "min": 0 } }
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "ECS/ContainerInsights", "ContainerInstanceCount", { "dimensions": { "ClusterName": "$ECS_CLUSTER" } } ],
          [ ".", "RunningTaskCount", { "dimensions": { "ServiceName": "$ECS_SERVICE", "ClusterName": "$ECS_CLUSTER" } } ],
          [ ".", "DesiredTaskCount", { "dimensions": { "ServiceName": "$ECS_SERVICE", "ClusterName": "$ECS_CLUSTER" } } ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "$AWS_REGION",
        "title": "ECS Container Insights"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "sprintlite-app", "SlowApiRequests", { "stat": "Sum", "period": 300 } ]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "$AWS_REGION",
        "title": "Slow API Requests (>1s)",
        "yAxis": { "left": { "min": 0 } }
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "fields @timestamp, @message, level, duration, statusCode | filter level = 'error' | stats count() by level",
        "region": "$AWS_REGION",
        "title": "Recent Errors (Last Hour)"
      }
    }
  ]
}
EOF

aws cloudwatch put-dashboard \
  --dashboard-name "$DASHBOARD_NAME" \
  --dashboard-body file:///tmp/dashboard-body.json \
  --region "$AWS_REGION"

echo -e "${GREEN}✅ Created CloudWatch Dashboard: $DASHBOARD_NAME${NC}\n"

# ============================================================================
# Step 4: Create CloudWatch Alarms
# ============================================================================
echo -e "${YELLOW}[Step 4] Creating CloudWatch Alarms...${NC}"

read -p "Enter SNS Topic ARN for alarm notifications (leave blank to skip): " SNS_TOPIC_ARN

# Alarm 1: High Error Count
if [ ! -z "$SNS_TOPIC_ARN" ]; then
  aws cloudwatch put-metric-alarm \
    --alarm-name "$ALARM_PREFIX-high-error-count" \
    --alarm-description "Alert when error count exceeds 10 in 5 minutes" \
    --metric-name ErrorCount \
    --namespace sprintlite-app \
    --statistic Sum \
    --period 300 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1 \
    --alarm-actions "$SNS_TOPIC_ARN" \
    --region "$AWS_REGION" 2>/dev/null || true
  
  echo -e "${GREEN}✅ Created alarm: high-error-count${NC}"
fi

# Alarm 2: High Warning Count
if [ ! -z "$SNS_TOPIC_ARN" ]; then
  aws cloudwatch put-metric-alarm \
    --alarm-name "$ALARM_PREFIX-high-warning-count" \
    --alarm-description "Alert when warning count exceeds 20 in 5 minutes" \
    --metric-name WarningCount \
    --namespace sprintlite-app \
    --statistic Sum \
    --period 300 \
    --threshold 20 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1 \
    --alarm-actions "$SNS_TOPIC_ARN" \
    --region "$AWS_REGION" 2>/dev/null || true
  
  echo -e "${GREEN}✅ Created alarm: high-warning-count${NC}"
fi

# Alarm 3: Slow API Requests
if [ ! -z "$SNS_TOPIC_ARN" ]; then
  aws cloudwatch put-metric-alarm \
    --alarm-name "$ALARM_PREFIX-slow-api-requests" \
    --alarm-description "Alert when >5 slow API requests in 5 minutes" \
    --metric-name SlowApiRequests \
    --namespace sprintlite-app \
    --statistic Sum \
    --period 300 \
    --threshold 5 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1 \
    --alarm-actions "$SNS_TOPIC_ARN" \
    --region "$AWS_REGION" 2>/dev/null || true
  
  echo -e "${GREEN}✅ Created alarm: slow-api-requests${NC}"
fi

echo ""

# ============================================================================
# Step 5: List available log streams
# ============================================================================
echo -e "${YELLOW}[Step 5] Log Streams${NC}"

echo "Waiting for log streams to appear (this may take a minute)..."
sleep 5

aws logs describe-log-streams \
  --log-group-name "$LOG_GROUP" \
  --region "$AWS_REGION" \
  --query 'logStreams[*].[logStreamName,lastEventTimestamp]' \
  --output table || echo "No log streams yet"

echo ""

# ============================================================================
# Step 6: Summary
# ============================================================================
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Setup Summary${NC}"
echo -e "${BLUE}================================================${NC}\n"

echo "Log Group:        $LOG_GROUP"
echo "Retention:        $LOG_RETENTION_DAYS days"
echo "Dashboard:        $DASHBOARD_NAME"
echo "Region:           $AWS_REGION"
echo "Metric Filters:   4 (ErrorCount, WarningCount, HttpErrorCount, SlowApiRequests)"
echo "Alarms Configured: $([ ! -z \"$SNS_TOPIC_ARN\" ] && echo \"Yes\" || echo \"No - provide SNS Topic ARN to enable\")"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Application logs will appear in CloudWatch Logs within 1-2 minutes"
echo "2. View logs: CloudWatch → Logs → Log Groups → $LOG_GROUP"
echo "3. View metrics: CloudWatch → Metrics → sprintlite-app"
echo "4. View dashboard: CloudWatch → Dashboards → $DASHBOARD_NAME"
echo "5. Query logs with Insights: CloudWatch → Logs → Insights"
echo ""

echo -e "${YELLOW}Example CloudWatch Insights Queries:${NC}"
echo "  - Count errors: fields @timestamp, level | filter level = 'error' | stats count()"
echo "  - Slow requests: fields @timestamp, duration | filter duration > 1000 | stats avg(duration)"
echo "  - By endpoint: fields @timestamp, endpoint | stats count() by endpoint"
echo ""

echo -e "${GREEN}✅ CloudWatch setup completed!${NC}\n"

# Cleanup
rm -f /tmp/dashboard-body.json
