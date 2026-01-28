# Unit Testing Framework Setup (DAY27-S)

## Overview
This document describes the Jest and React Testing Library (RTL) configuration for the SprintLite Team Management App. Unit tests validate individual components and utilities in isolation, ensuring code quality and preventing regressions.

## Why Unit Testing Matters
- **Fast Feedback**: Tests run quickly, providing immediate validation during development
- **Regression Prevention**: Automated tests catch bugs before they reach production
- **Confidence in Refactoring**: Tests ensure existing functionality remains intact
- **Documentation**: Tests serve as living documentation of how code should behave
- **Foundation of Testing Pyramid**: Unit tests form the base—most tests should be units

## Installation & Setup

### Dependencies Installed
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest jest-environment-jsdom
```

### Configuration Files

#### jest.config.js
Main Jest configuration:
- **Test Environment**: jsdom (browser-like environment)
- **Setup File**: jest.setup.js for RTL matchers
- **Coverage Collection**: Enabled for lib/, components/, hooks/, context/, and app/
- **Coverage Path Ignore**: Excludes node_modules, .next, and coverage directories
- **Module Mapping**: `@/*` paths resolved correctly

#### jest.setup.js
Initializes RTL matchers globally:
```javascript
import '@testing-library/jest-dom';
```
This enables matchers like `toBeInTheDocument()`, `toHaveTextContent()`, etc.

## Test Scripts

Added to `package.json`:
- `npm test` — Run all tests once
- `npm run test:watch` — Run tests in watch mode (re-run on file changes)
- `npm run test:coverage` — Generate coverage reports

## Sample Tests

### 1. Utility Function Test (`__tests__/validation.test.js`)
Tests pure functions in isolation:

```javascript
import { validateEmail } from '@/lib/validation';

describe('validateEmail utility', () => {
  test('returns true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('returns false for invalid email addresses', () => {
    expect(validateEmail('invalid.email')).toBe(false);
  });
});
```

**Coverage**: 53.33% for validation module
- Tests: 3 passed ✓
- Key assertions: valid/invalid emails, null/undefined handling

### 2. Component Test (`__tests__/Button.test.jsx`)
Tests React component rendering and interactions:

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/Button';

describe('Button component', () => {
  test('renders button with children text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('triggers onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByText('Click'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Coverage**: 100% statements for Button component
- Tests: 6 passed ✓
- Key scenarios: rendering, click handling, disabled state, variants, sizes

## Coverage Report

### Current Metrics (9 tests)
```
Test Suites: 2 passed, 2 total
Tests:       9 passed, 9 total
Snapshots:   0 total

Overall Coverage:
- Statements: 0.49%
- Branches: 0.59%
- Functions: 0.46%
- Lines: 0.48%
```

### Tested Modules
- **lib/validation.js** (53.33% coverage) — Core validation utilities
- **components/Button.jsx** (100% coverage) — UI component

### Next Steps for Coverage Growth
1. Add tests for authentication utilities (`lib/auth.js`)
2. Add tests for error handling (`lib/errorHandler.js`)
3. Add tests for API routes (`app/api/*`)
4. Add integration tests for complex flows
5. Target: 80% coverage on critical paths

## Running Tests

### Basic Test Execution
```bash
# Run all tests
npm test

# Watch mode - re-run on file changes
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Output Example
```
 PASS  __tests__/Button.test.jsx
 PASS  __tests__/validation.test.js

Tests:       9 passed, 9 total
Time:        4.881 s
```

## Testing Best Practices Applied

### 1. Isolation
- Tests focus on single units (functions or components)
- Dependencies are mocked or stubbed
- No external API calls or database queries

### 2. Descriptive Test Names
- Test names describe what is being tested
- Examples: `renders button with children text`, `returns true for valid email addresses`

### 3. Arrange-Act-Assert Pattern
```javascript
// Arrange - set up test data and conditions
const handleClick = jest.fn();
render(<Button onClick={handleClick}>Click</Button>);

// Act - perform the action being tested
await user.click(screen.getByText('Click'));

// Assert - verify the expected outcome
expect(handleClick).toHaveBeenCalledTimes(1);
```

### 4. User-Centric Testing
- Use `@testing-library/user-event` instead of `fireEvent` for realistic interactions
- Test behavior users care about, not implementation details

### 5. Meaningful Assertions
- Each test verifies one specific behavior
- Assertions are clear and focused
- Multiple related scenarios grouped in `describe` blocks

## Integration with CI/CD

### GitHub Actions Example
Add to `.github/workflows/test.yml`:
```yaml
- name: Run Unit Tests
  run: npm test

- name: Generate Coverage
  run: npm run test:coverage
```

Tests will automatically run on:
- Pull requests
- Commits to main/develop branches
- Can fail builds if coverage thresholds aren't met

## Test Structure

```
__tests__/
├── Button.test.jsx          # Component tests
├── validation.test.js       # Utility function tests
└── ... (add more as needed)

lib/
├── validation.js            # Utility functions being tested
└── ... (existing code)

components/
├── Button.jsx               # Components being tested
└── ... (existing code)
```

## Files Modified/Created

| File | Type | Purpose |
|------|------|---------|
| jest.config.js | New | Jest configuration |
| jest.setup.js | New | RTL matchers setup |
| __tests__/validation.test.js | New | Utility function tests |
| __tests__/Button.test.jsx | New | Component tests |
| lib/validation.js | New | Validation utilities for testing |
| package.json | Modified | Added test scripts |

## Reflection: Testing Pyramid

### Current Position
- **Unit Tests** (✓ Implemented): 9 tests covering utilities and components
- **Integration Tests** (Planned): Testing multiple modules together
- **E2E Tests** (Future): Testing full workflows in browser

### Why This Order?
1. Unit tests are fast and provide immediate feedback
2. Integration tests verify modules work together correctly
3. E2E tests validate complete user workflows

### Coverage Strategy
- Start with critical paths (auth, validation, core utilities)
- Gradually increase coverage as codebase stabilizes
- Aim for 80% coverage on new code going forward
- Use coverage reports to identify untested code areas

## Next Assignment: Integration Testing

After unit testing mastery, consider:
- Testing API routes with mock databases
- Testing component interactions with context/state
- Testing error scenarios and edge cases
- Using Mock Service Worker (MSW) for API mocking

## Troubleshooting

### Tests Won't Run
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Module Resolution Issues
- Ensure `@/` paths in jest.config.js match tsconfig.json
- Check that files are in correct directories

### Coverage Below Expected
- Coverage thresholds removed from jest.config to allow gradual growth
- Add more tests before enabling strict thresholds
- Run `npm run test:coverage` to identify untested code

## Commands Reference

```bash
# Run tests once
npm test

# Watch mode - re-run on changes
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test Button.test

# Run tests matching pattern
npm test -- --testNamePattern="Button"

# Update snapshots (if using)
npm test -- --updateSnapshot
```

## Conclusion

Jest and RTL are now fully configured for SprintLite. The test suite provides:
- ✅ 9 passing tests
- ✅ Utility and component test examples
- ✅ CI/CD integration ready
- ✅ Coverage reporting
- ✅ Foundation for growing the test suite

As the codebase evolves, incrementally add tests for critical functionality, aiming toward the 80% coverage target for a safe, maintainable application.
