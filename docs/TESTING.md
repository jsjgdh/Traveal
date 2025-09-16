# Testing and Development Workflow Documentation

## Overview

This document outlines the testing strategy and development workflow for the Traveal application, covering unit testing, integration testing, end-to-end testing, and development best practices.

## Testing Strategy

### Testing Pyramid
- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: All API endpoints and database operations
- **End-to-End Tests**: Critical user journeys
- **Component Tests**: All React components with user interactions

### Testing Frameworks

#### Frontend
- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **Cypress**: End-to-end testing
- **MSW**: API mocking

#### Backend
- **Jest**: Node.js testing framework
- **Supertest**: HTTP assertion library
- **Prisma Test Client**: Database testing
- **ts-jest**: TypeScript support

## Unit Testing

### Frontend Component Testing
```javascript
// src/components/__tests__/Header.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

describe('Header Component', () => {
  test('renders NATPAC logo and title', () => {
    render(<Header />, { wrapper: BrowserRouter });
    expect(screen.getByText('NATPAC')).toBeInTheDocument();
  });

  test('shows back button on non-home routes', () => {
    window.history.pushState({}, 'Test', '/dashboard');
    render(<Header />, { wrapper: BrowserRouter });
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });
});
```

### Backend Service Testing
```javascript
// backend/src/services/__tests__/authService.test.ts
import { AuthService } from '../authService';
import { prismaMock } from '../__mocks__/prisma';

describe('AuthService', () => {
  test('creates new user with valid data', async () => {
    const userData = {
      deviceId: 'test-device-123',
      consentData: { locationData: { allowTracking: true } }
    };

    prismaMock.user.create.mockResolvedValue({
      id: 'user-123',
      deviceId: userData.deviceId
    });

    const result = await AuthService.register(userData);
    expect(result.user.id).toBe('user-123');
  });
});
```

## Integration Testing

### API Testing
```javascript
// backend/src/routes/__tests__/auth.test.ts
import request from 'supertest';
import app from '../../app';

describe('Auth Routes', () => {
  test('registers new user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .set('X-Device-ID', 'device-123')
      .send({ consentData: { locationData: { allowTracking: true } } })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBeDefined();
  });
});
```

## End-to-End Testing

### Cypress Configuration
```javascript
// cypress.config.js
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 375,
    viewportHeight: 667
  }
});
```

### E2E Test Example
```javascript
// cypress/e2e/onboarding.cy.js
describe('Onboarding Flow', () => {
  it('completes full onboarding process', () => {
    cy.visit('/');
    cy.contains('Welcome to Traveal').should('be.visible');
    cy.get('[data-testid="welcome-next-button"]').click();
    
    // Privacy consent
    cy.get('[data-testid="location-allow-tracking"]').check();
    cy.get('[data-testid="consent-next-button"]').click();
    
    // Complete setup
    cy.get('[data-testid="complete-onboarding-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Development Workflow

### Git Workflow
1. **Feature Branches**: Create branch from `main`
2. **Commits**: Use conventional commit messages
3. **Pull Requests**: Require code review and tests
4. **CI/CD**: Automated testing and deployment

### Code Quality

#### ESLint Configuration
```javascript
// eslint.config.js
export default [
  {
    rules: {
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
];
```

#### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## Running Tests

### Frontend Tests
```bash
npm test                    # Run all tests
npm test -- --watch       # Watch mode
npm test -- --coverage    # Coverage report
```

### Backend Tests
```bash
cd backend
npm test                   # Run all tests
npm run test:coverage     # Coverage report
npm run test:watch        # Watch mode
```

### E2E Tests
```bash
npx cypress open          # Interactive mode
npx cypress run           # Headless mode
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci
      
      - name: Run tests
        run: |
          npm test -- --coverage
          cd backend && npm test -- --coverage
      
      - name: E2E tests
        run: npx cypress run
```

## Performance Testing

### Frontend Performance
```bash
# Bundle analysis
npm run build
npx vite-bundle-analyzer dist/

# Lighthouse audit
npx lighthouse http://localhost:5173
```

### Backend Performance
```bash
# Load testing with autocannon
npx autocannon -c 10 -d 30 http://localhost:3001/health

# Memory profiling
node --prof backend/dist/app.js
```

## Test Coverage Goals

- **Unit Tests**: 80%+ line coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user paths
- **Component Tests**: All interactive components

## Best Practices

1. **Test Behavior**: Focus on what users see and do
2. **Isolation**: Tests should not depend on each other
3. **Fast Feedback**: Keep tests fast for quick development
4. **Real User Scenarios**: Test actual user workflows
5. **Maintainable**: Keep tests simple and readable

For more information, see:
- [API Documentation](./API.md)
- [Component Documentation](./COMPONENTS.md)
- [Deployment Guide](./DEPLOYMENT.md)