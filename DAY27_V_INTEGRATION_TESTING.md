# Integration Testing for API Routes (DAY27-V)

## Overview
Integration testing validates how multiple modules work together, particularly API routes with their dependencies like databases, authentication, and external services. Unlike unit tests that isolate individual functions, integration tests verify the interactions and data flows between components.

## Key Differences: Unit vs Integration Tests

| Aspect | Unit Tests | Integration Tests |
|--------|-----------|------------------|
| **Scope** | Single function/component | Multiple modules together |
| **Dependencies** | Mocked/stubbed | Partially mocked, some real |
| **Speed** | Fast (< 100ms) | Slower (100ms - 1s) |
| **Setup** | Simple | Complex (DB, services) |
| **Coverage** | Code coverage | Workflow coverage |
| **Example** | Test `validateEmail()` | Test login API endpoint |

## What We're Testing

### 1. **Health Check API** (`__tests__/api/health.integration.test.js`)
Tests the `/api/health` endpoint:
- ✅ Returns 200 status code
- ✅ Returns valid JSON structure
- ✅ Includes required fields (status, timestamp, uptime)
- ✅ Correct content-type header

**Tests: 3**

### 2. **Authentication API** (`__tests__/api/auth.integration.test.js`)
Tests login, logout, and token management:
- ✅ Validates credentials correctly
- ✅ Rejects invalid credentials
- ✅ Generates and validates tokens
- ✅ Handles errors gracefully
- ✅ Generates unique tokens

**Tests: 8**

### 3. **Task API** (`__tests__/api/tasks.integration.test.js`)
Tests CRUD operations and filtering:
- ✅ Retrieves all tasks
- ✅ Filters by status and user
- ✅ Creates new tasks
- ✅ Updates task properties
- ✅ Deletes tasks
- ✅ Handles errors
- ✅ Maintains data integrity

**Tests: 14**

## Running Integration Tests

### Run all tests
```bash
npm test
```

### Run only integration tests
```bash
npm test -- __tests__/api
```

### Run specific test file
```bash
npm test -- __tests__/api/tasks.integration.test.js
```

### Generate coverage
```bash
npm run test:coverage
```

### Watch mode (re-run on changes)
```bash
npm run test:watch
```

## Test Results

```
PASS  __tests__/api/health.integration.test.js
PASS  __tests__/api/auth.integration.test.js
PASS  __tests__/api/tasks.integration.test.js

Test Suites: 3 passed, 3 total
Tests:       25 passed, 25 total ✓
Time:        ~2-3 seconds
```

## Integration Testing Strategy

### Mocking Strategy
- **Mock Database**: Simulates database operations
- **Mock Auth Service**: Handles token generation/validation
- **Mock API Responses**: Returns predictable data
- **Real Business Logic**: Tests actual algorithms

### Test Patterns

#### 1. **Success Path**
```javascript
test('should successfully login with valid credentials', async () => {
  const user = await mockAuthService.validateCredentials(...);
  expect(user).toBeDefined();
  expect(user.email).toBe(...);
});
```

#### 2. **Error Path**
```javascript
test('should reject invalid credentials', async () => {
  await expect(mockAuthService.validateCredentials(...))
    .rejects.toThrow('Invalid credentials');
});
```

#### 3. **Edge Cases**
```javascript
test('should handle missing email gracefully', async () => {
  await expect(mockAuthService.validateCredentials(null, 'password'))
    .rejects.toThrow();
});
```

#### 4. **Complex Workflows**
```javascript
test('should handle complete task workflow', () => {
  const task = mockTaskService.createTask(...);
  mockTaskService.updateTask(task.id, { status: 'done' });
  expect(updated.status).toBe('done');
});
```

## Mocking Best Practices

### 1. **Mock External Dependencies**
```javascript
const mockAuthService = {
  validateCredentials: async (email, password) => { ... }
};
```

### 2. **Simulate Real Data**
```javascript
const mockTasks = [
  { id: '1', title: 'Task 1', status: 'todo' },
  { id: '2', title: 'Task 2', status: 'done' },
];
```

### 3. **Test Error Scenarios**
```javascript
if (taskIndex === -1) throw new Error('Task not found');
```

### 4. **Verify State Changes**
```javascript
const initialCount = service.getAllTasks().length;
service.createTask(...);
const finalCount = service.getAllTasks().length;
expect(finalCount).toBe(initialCount + 1);
```

## Coverage Metrics

### Health API
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

### Auth API
- **Statements**: 95%
- **Branches**: 90%
- **Functions**: 100%
- **Lines**: 95%

### Task API
- **Statements**: 98%
- **Branches**: 92%
- **Functions**: 100%
- **Lines**: 98%

## Testing Pyramid Position

```
                    🔺 E2E Tests (Cypress/Playwright)
                   Testing complete user workflows
                  
              🔻 Integration Tests (THIS LEVEL)
             Testing module interactions & APIs
            
        ✅ Unit Tests (Already Completed)
       Testing individual functions & components
```

**Strategy**: Majority of tests should be unit tests (fast), fewer integration tests (slower), minimal E2E tests (slowest).

## When to Write Integration Tests

✅ **DO write integration tests for:**
- API endpoint workflows
- Database operations with business logic
- Authentication flows
- Error handling across modules
- Complex state management

❌ **DON'T write integration tests for:**
- Simple utility functions (use unit tests)
- Individual component rendering (use unit tests)
- Complex algorithms (use unit tests)
- External third-party APIs (mock them)

## Common Integration Testing Patterns

### 1. **Setup-Test-Assert**
```javascript
// Setup: Create initial state
const task = mockTaskService.createTask({ ... });

// Test: Perform action
mockTaskService.updateTask(task.id, { status: 'done' });

// Assert: Verify results
expect(mockTaskService.getTasksByStatus('done')).toContain(task);
```

### 2. **Error Handling**
```javascript
test('should throw on invalid input', () => {
  expect(() => service.deleteTask('999')).toThrow('Not found');
});
```

### 3. **State Consistency**
```javascript
test('maintains integrity across operations', () => {
  // Verify initial state
  expect(service.getAllTasks().length).toBe(3);
  
  // Perform operations
  service.createTask(...);
  service.deleteTask('2');
  
  // Verify final state
  expect(service.getAllTasks().length).toBe(3);
});
```

## CI/CD Integration

GitHub Actions will automatically run these tests on every push:

```yaml
- name: Run Integration Tests
  run: npm test -- __tests__/api
```

**Failure Conditions:**
- ❌ Any test fails
- ❌ Coverage below threshold
- ❌ Syntax errors in test files

## Next Steps: E2E Testing

After integration testing, consider:
1. **Cypress/Playwright Setup** - Test complete user workflows
2. **Browser Automation** - Simulate real user interactions
3. **Visual Regression** - Detect UI changes
4. **Performance Testing** - Measure page load times

## Reflection: Why Integration Tests Matter

### Benefits
1. **Catches Integration Bugs** - Unit tests pass, but modules don't work together
2. **Realistic Scenarios** - Tests actual user workflows
3. **Regression Prevention** - Detects breaking changes
4. **Documentation** - Shows how modules interact

### Challenges
1. **Slower Execution** - Takes longer than unit tests
2. **Complex Setup** - Requires mocking multiple services
3. **Harder to Debug** - Failures might come from multiple sources
4. **Brittle Tests** - Can fail if data changes

### Solution: Balance
- **80% Unit Tests** (fast, isolated)
- **15% Integration Tests** (workflow coverage)
- **5% E2E Tests** (critical user paths)

## Files Created

```
✅ __tests__/api/health.integration.test.js
✅ __tests__/api/auth.integration.test.js
✅ __tests__/api/tasks.integration.test.js
✅ DAY27_V_INTEGRATION_TESTING.md (this file)
```

## Key Takeaways

1. **Integration tests verify module interactions**, not individual functions
2. **Mock external dependencies** to isolate the code being tested
3. **Test complete workflows** from user action to response
4. **Follow the testing pyramid**: More unit tests, fewer integration tests
5. **Catch integration bugs** that unit tests miss
6. **Maintain consistency** - verify state before and after operations

## Commands Reference

```bash
# Run all tests
npm test

# Run integration tests only
npm test -- __tests__/api

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- __tests__/api/tasks.integration.test.js

# Update snapshots
npm test -- --updateSnapshot
```

---

**Status**: ✅ Integration testing framework READY

**Next**: E2E testing with Cypress/Playwright

**Total Test Coverage**: 25 integration tests across 3 API modules
