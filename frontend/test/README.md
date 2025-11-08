# Unit Tests for Dallosh Analysis Frontend

This directory contains unit tests for the Next.js frontend application.

## Structure

```
test/
├── units/              # Unit tests for services, stores, and utilities
│   ├── utils.test.ts
│   ├── client.test.ts
│   ├── auth.service.test.ts
│   ├── auth.store.test.ts
│   └── files.service.test.ts
└── e2e/               # End-to-end tests (to be implemented)
```

## Running Tests

### Run all unit tests:
```bash
npm test
# or
bun test
```

### Run tests in watch mode:
```bash
npm run test:watch
# or
bun run test:watch
```

### Run tests with coverage:
```bash
npm run test:coverage
# or
bun run test:coverage
```

### Run a specific test file:
```bash
npm test -- utils.test.ts
```

### Run tests matching a pattern:
```bash
npm test -- --testNamePattern="login"
```

## Test Coverage

The unit tests cover:

1. **Utility Functions** (`utils.test.ts`):
   - Class name merging (`cn`)
   - UID generation
   - Date formatting

2. **API Client** (`client.test.ts`):
   - Token management
   - HTTP methods (GET, POST, PATCH, DELETE, PUT)
   - Request/response interceptors
   - Error handling

3. **Auth Service** (`auth.service.test.ts`):
   - User registration
   - User login
   - Get current user
   - Update account
   - Delete account
   - Token refresh
   - Logout
   - Authentication check

4. **Auth Store** (`auth.store.test.ts`):
   - Initial state
   - Login action
   - Register action
   - Logout action
   - User and token setters
   - User refresh
   - Store initialization

5. **Files Service** (`files.service.test.ts`):
   - File upload
   - Fetch all files
   - Fetch single file
   - Delete file
   - Download file

## Writing New Tests

When adding new tests:

1. Follow the naming convention: `<module-name>.test.ts`
2. Use descriptive test descriptions: `describe('Feature', () => { it('should do something', () => {}) })`
3. Mock external dependencies (API calls, localStorage, etc.)
4. Test both success and error cases
5. Use Jest matchers appropriately

## Example Test Structure

```typescript
/**
 * Unit tests for <ServiceName>
 */
import { serviceName } from '@/services/serviceName';
import apiClient from '@/services/client';

jest.mock('@/services/client');

describe('ServiceName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something successfully', async () => {
      // Arrange
      const mockData = { /* ... */ };
      mockedApiClient.get.mockResolvedValue(mockData);

      // Act
      const result = await serviceName.methodName();

      // Assert
      expect(result).toEqual(mockData);
      expect(mockedApiClient.get).toHaveBeenCalled();
    });
  });
});
```

## Dependencies

Tests require:
- `jest>=29.7.0`
- `jest-environment-jsdom>=29.7.0`
- `@testing-library/jest-dom>=6.4.2`
- `@testing-library/react>=16.0.1`
- `@testing-library/user-event>=14.5.2`

Install test dependencies:
```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest
# or
bun add -d jest jest-environment-jsdom @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest
```

## Configuration

Jest configuration is in `jest.config.js` and `jest.setup.js`:
- Uses Next.js Jest preset
- Configures module path aliases (`@/` -> `src/`)
- Sets up testing library matchers
- Mocks Next.js navigation and themes

## Notes

- Tests run in a JSDOM environment (simulates browser)
- `localStorage` and `window` are available in tests
- Next.js routing is mocked to prevent navigation during tests
- Theme provider is mocked for consistent testing

