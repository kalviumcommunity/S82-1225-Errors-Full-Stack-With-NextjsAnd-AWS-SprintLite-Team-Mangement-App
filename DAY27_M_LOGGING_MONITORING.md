# DAY27-M: Logging & Monitoring Implementation

## ✅ What Was Implemented

### 1. **Structured Logger Utility** ✅
**File:** `lib/logger.ts`

**Features:**
- JSON-formatted logging with correlation IDs
- Multiple severity levels (info, warn, error, debug)
- Request tracing with unique request IDs
- Timestamp in ISO 8601 format
- Service name, version, environment metadata
- Specialized logging methods for different scenarios

**Log Entry Structure:**
```json
{
  "timestamp": "2026-01-28T10:30:45.123Z",
  "level": "info",
  "requestId": "1234567890-abc123",
  "message": "API request received",
  "serviceName": "sprintlite-app",
  "version": "1.0.0",
  "environment": "production",
  "endpoint": "/api/tasks",
  "method": "GET"
}
```

**Available Methods:**
- `logger.info()` - Log informational message
- `logger.warn()` - Log warning
- `logger.error()` - Log error with stack trace
- `logger.debug()` - Log debug info (dev only)
- `logger.logRequest()` - Log API request
- `logger.logResponse()` - Log API response with duration
- `logger.logApiError()` - Log API error with full context
- `logger.logDatabaseOperation()` - Log database operations
- `logger.logAuthEvent()` - Log authentication events
- `logger.logBusinessEvent()` - Log business logic events
- `logger.logMetric()` - Log performance metrics

### 2. **Health Check API with Logging** ✅
**File:** `app/api/health/route.ts`

**Endpoint:** `GET /api/health`

**Features:**
- Logs every health check request
- Tracks response duration
- Includes correlation ID
- Returns health status and uptime
- Used by load balancer health checks

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T10:30:45.123Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "api_server": true,
    "database": true,
    "cache": true
  }
}
```

### 3. **AWS CloudWatch Configuration** ✅
**File:** `task-definition.json` (UPDATED)

**Added CloudWatch logging driver:**
```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/sprintlite-app",
    "awslogs-region": "us-east-1",
    "awslogs-stream-prefix": "ecs",
    "awslogs-datetime-format": "%Y-%m-%d %H:%M:%S"
  }
}
```

**What This Does:**
- Sends all container logs to CloudWatch Logs automatically
- Creates log streams per task instance
- Enables log aggregation and search
- No application code changes needed

### 4. **CloudWatch Setup Script** ✅
**File:** `scripts/setup-monitoring.sh`

**Automates:**
1. ✅ Create CloudWatch log group (or use existing)
2. ✅ Set log retention policy (7/14/30 days)
3. ✅ Create 4 metric filters:
   - ErrorCount: `{ $.level = "error" }`
   - WarningCount: `{ $.level = "warn" }`
   - HttpErrorCount: `{ $.statusCode >= 400 }`
   - SlowApiRequests: `{ $.duration > 1000 }`
4. ✅ Create CloudWatch Dashboard with 4 widgets
5. ✅ Create 3 CloudWatch Alarms (with SNS notifications)

**Usage:**
```bash
bash scripts/setup-monitoring.sh
```

**Metric Filters Explanation:**
- **ErrorCount**: Counts any log entry with level="error"
- **WarningCount**: Counts logs with level="warn"  
- **HttpErrorCount**: Counts API responses with 4xx/5xx status codes
- **SlowApiRequests**: Counts requests taking >1000ms

### 5. **CloudWatch Query Script** ✅
**File:** `scripts/query-cloudwatch.ps1`

**PowerShell script to query CloudWatch logs directly:**

**Query Types:**

1. **Recent Errors** (show last hour's errors)
   ```powershell
   .\scripts\query-cloudwatch.ps1 -QueryType recent-errors -HoursBack 1
   ```
   Returns: All error-level logs with messages and details

2. **Slow Requests** (requests >1000ms)
   ```powershell
   .\scripts\query-cloudwatch.ps1 -QueryType slow-requests
   ```
   Returns: Endpoints taking >1 second with exact durations

3. **Recent Logs** (last 100 logs)
   ```powershell
   .\scripts\query-cloudwatch.ps1 -QueryType recent-logs
   ```
   Returns: Latest logs from the stream

4. **Metrics** (summary statistics)
   ```powershell
   .\scripts\query-cloudwatch.ps1 -QueryType metrics
   ```
   Returns: Total errors, warnings count for time period

### 6. **Environment Configuration Files** ✅

**Created `.env.monitoring`:**
- CloudWatch log group name
- Log retention days (7, 14, 30, 90)
- Logging enable/disable flags
- Alarm thresholds
- Metric namespace
- SNS topic for alerts
- Dashboard name

**Updated `.env.production`:**
Added CloudWatch configuration:
```dotenv
CLOUDWATCH_LOG_GROUP=/ecs/sprintlite-app
CLOUDWATCH_LOG_RETENTION_DAYS=7
ENABLE_STRUCTURED_LOGGING=true
LOG_LEVEL=info
ALARM_ERROR_THRESHOLD=10
ALARM_WARNING_THRESHOLD=20
```

---

## 🚀 How to Deploy & Use

### Step 1: Run Setup Script
```bash
# Creates log group, metric filters, dashboard, and alarms
bash scripts/setup-monitoring.sh
```

When prompted:
- ECS Cluster name: `sprintlite-cluster`
- ECS Service name: `sprintlite-app-service`
- SNS Topic ARN: `arn:aws:sns:us-east-1:ACCOUNT:topic-name` (for alerts)

### Step 2: Deploy Updated Task Definition
```bash
# Register the new task definition with CloudWatch logging
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region us-east-1
```

### Step 3: Update ECS Service
```bash
# Point service to new task definition
aws ecs update-service \
  --cluster sprintlite-cluster \
  --service sprintlite-app-service \
  --task-definition sprintlite-app-task:LATEST \
  --region us-east-1
```

### Step 4: Verify Logs Appear
Logs appear in CloudWatch within 1-2 minutes:

```powershell
# Query for recent errors
.\scripts\query-cloudwatch.ps1 -QueryType recent-errors

# Query for slow requests
.\scripts\query-cloudwatch.ps1 -QueryType slow-requests

# View metrics summary
.\scripts\query-cloudwatch.ps1 -QueryType metrics
```

---

## 📊 CloudWatch Insights Queries

Access via: AWS Console → CloudWatch → Logs → Insights

### Query 1: Count Errors by Type
```
fields level | filter level = "error" | stats count() by level
```

### Query 2: Average Response Time by Endpoint
```
fields endpoint, duration 
| stats avg(duration) as avg_duration by endpoint 
| sort avg_duration desc
```

### Query 3: Failed Authentication Attempts
```
fields userId, success 
| filter event = "login_failed" 
| stats count() as failed_logins by userId
```

### Query 4: API Errors Over Time
```
fields @timestamp, statusCode 
| filter statusCode >= 400 
| stats count() as error_count by bin(5m)
```

### Query 5: Slowest Database Operations
```
fields operation, table, duration 
| filter ispresent(duration) 
| stats max(duration) as max_time, avg(duration) as avg_time by operation, table
| sort max_time desc
```

---

## 🔔 Alarms Configured

The setup script creates 3 CloudWatch Alarms:

### Alarm 1: High Error Count
- **Metric:** ErrorCount
- **Threshold:** >10 errors in 5 minutes
- **Action:** Send SNS notification

### Alarm 2: High Warning Count
- **Metric:** WarningCount
- **Threshold:** >20 warnings in 5 minutes
- **Action:** Send SNS notification

### Alarm 3: Slow API Requests
- **Metric:** SlowApiRequests
- **Threshold:** >5 slow requests in 5 minutes
- **Action:** Send SNS notification

**Alerting Workflow:**
```
App logs error → CloudWatch detects pattern → Alarm triggered → SNS publishes → Email/Slack alert
```

---

## 📈 Dashboard Visualization

The CloudWatch Dashboard shows 4 widgets:

### Widget 1: Error & Warning Metrics
- Line chart of ErrorCount, WarningCount, HttpErrorCount
- Shows error trends over time

### Widget 2: ECS Container Insights
- Running task count vs desired count
- Container instance count
- Shows cluster health

### Widget 3: Slow API Requests
- Count of requests taking >1 second
- Helps identify performance issues

### Widget 4: Recent Errors (Logs Widget)
- Direct log query showing recent errors
- Displays error count by level

---

## 📝 Log Retention & Costs

### Retention Policy
Set in setup script or `.env.monitoring`:

| Days | Use Case | Cost (approx) |
|------|----------|-------------|
| 7 | Development/Testing | $0.50/month |
| 14 | Staging | $0.80/month |
| 30 | Production (normal) | $2.00/month |
| 90 | Compliance/Audit | $6.00/month |

### Cost Optimization
1. Use 7-day retention for active troubleshooting
2. Archive older logs to S3 for long-term storage
3. Use metric filters instead of querying raw logs (faster, cheaper)
4. Delete unnecessary metrics after investigation

---

## 🔍 How to Debug Issues

### Issue: Logs not appearing in CloudWatch
**Solution:**
1. Verify log group exists: `/ecs/sprintlite-app`
2. Check ECS task has IAM permission for `logs:CreateLogStream` and `logs:PutLogEvents`
3. Restart ECS task (new logs appear immediately)
4. Check task execution role has CloudWatch permissions

### Issue: Metrics not updating
**Solution:**
1. Verify metric filters have correct pattern syntax
2. Generate test logs matching the pattern
3. Metrics update every 1-2 minutes (not real-time)
4. Check CloudWatch Insights queries for syntax errors

### Issue: Alarms not triggering
**Solution:**
1. Verify SNS topic ARN is correct in setup
2. Confirm SNS subscription is active (check email)
3. Manually trigger alarm for testing: AWS Console → Alarms → Test Alarm

---

## 📊 Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `lib/logger.ts` | ✨ Created | Structured JSON logger utility |
| `app/api/health/route.ts` | ✨ Created | Health check with logging |
| `task-definition.json` | ✏️ Updated | Added CloudWatch logging driver |
| `scripts/setup-monitoring.sh` | ✨ Created | Automate CloudWatch setup |
| `scripts/query-cloudwatch.ps1` | ✨ Created | Query logs from PowerShell |
| `.env.monitoring` | ✨ Created | Monitoring configuration |
| `.env.production` | ✏️ Updated | Added CloudWatch settings |

---

## ✅ Verification Checklist

All implemented:
- [x] Structured JSON logger with correlation IDs
- [x] Health check endpoint with logging
- [x] CloudWatch logging driver configured
- [x] Log group created with retention policy
- [x] 4 metric filters created
- [x] CloudWatch Dashboard created
- [x] 3 CloudWatch Alarms configured
- [x] Query script for log analysis
- [x] Environment variables configured
- [x] Documentation complete

---

## 🎬 For Video Demo

Show:
1. **Logger Code** - How JSON logs are structured
2. **CloudWatch Logs** - Navigate to log group and show logs
3. **Metric Filters** - Show error/warning patterns
4. **Dashboard** - Click through 4 widgets
5. **Query Script** - Run PowerShell to query recent errors
6. **Alarms** - Show alarm configuration and SNS notifications

**Video Length:** 3-4 minutes

