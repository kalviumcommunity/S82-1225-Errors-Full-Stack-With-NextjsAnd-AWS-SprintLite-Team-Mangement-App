# Testing Redis Cache Performance

## Prerequisites
1. Redis server running locally on port 6379
2. Dev server running: `npm run dev`

## Manual Testing Steps

### Test 1: Cache Miss (Cold Request)
```bash
curl http://localhost:3000/api/users?page=1&limit=10
```

**Expected output:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "_cache": {
      "hit": false,
      "responseTime": "~150ms"
    }
  }
}
```

**Console output:**
```
❌ Cache MISS for users:list:page=1:limit=10:role=all:search=none - Fetching from database
💾 Cached users:list:page=1:limit=10:role=all:search=none with 60s TTL (150ms)
```

### Test 2: Cache Hit (Warm Request)
Run the same command again within 60 seconds:
```bash
curl http://localhost:3000/api/users?page=1&limit=10
```

**Expected output:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "_cache": {
      "hit": true,
      "responseTime": "~15ms"
    }
  }
}
```

**Console output:**
```
✅ Cache HIT for users:list:page=1:limit=10:role=all:search=none (15ms)
```

### Test 3: Cache Invalidation
Create a new user to invalidate cache:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

**Console output:**
```
🗑️  Cache invalidated: users:list:* (new user created)
```

### Test 4: Verify Cache Was Invalidated
Run the GET request again:
```bash
curl http://localhost:3000/api/users?page=1&limit=10
```

**Expected:** Cache MISS again (fetches from database)

## Performance Comparison

| Request Type | Response Time | Source |
|--------------|---------------|--------|
| Cold (DB)    | ~100-300ms    | PostgreSQL |
| Warm (Cache) | ~10-50ms      | Redis |
| **Improvement** | **70-90% faster** | - |

## Automated Test Script

Run the automated performance test:
```bash
node scripts/test-cache-performance.js
```

This will:
1. Make 3 requests to /api/users
2. Make 3 requests to /api/tasks
3. Measure and compare cold vs warm request times
4. Calculate performance improvements
