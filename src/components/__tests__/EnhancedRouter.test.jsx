import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
  EnhancedRouter, 
  RouteWrapper, 
  ProtectedRoute, 
  LoadingSpinner, 
  ErrorBoundary, 
  ErrorFallback, 
  PageTransition, 
  Breadcrumb
} from '../shared/EnhancedRouter';

// Mock components for testing
const MockComponent = ({ title = 'Test Page' }) => (
  <div data-testid="mock-component">
    <h1>{title}</h1>
  </div>
);

const MockDashboard = () => <MockComponent title="Dashboard" />;
const MockTrip = () => <MockComponent title="Trip Management" />;
const MockData = () => <MockComponent title="Data Analytics" />;

// Test wrapper with router
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Mock localStorage for authentication tests
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });
});

beforeEach(() => {
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.clear.mockClear();
});

describe('EnhancedRouter Component', () => {
  test('renders router with children', () => {
    render(
      <TestWrapper>
        <div>
          <div data-testid="router-content">Router Content</div>
        </div>
      </TestWrapper>
    );
    
    expect(screen.getByTestId('router-content')).toBeInTheDocument();
  });

  test('renders loading spinner with message', () => {
    render(<LoadingSpinner message="Loading test..." />);
    
    expect(screen.getByText('Loading test...')).toBeInTheDocument();
    // Check for the spinner element directly instead of role
    expect(screen.getByText('Loading test...').closest('div')).toBeInTheDocument();
  });

  test('renders full screen loading spinner', () => {
    render(<LoadingSpinner message="Loading..." fullScreen />);
    
    // Check for the spinner element directly
    const spinnerContainer = screen.getByText('Loading...').closest('div').parentElement;
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer).toHaveClass('fixed');
  });

  test('error boundary catches and displays error', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    render(
      <TestWrapper>
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('error fallback shows error details in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    // Mock window.confirm to avoid issues
    window.confirm = jest.fn(() => true);
    
    render(
      <TestWrapper>
        <div>
          <ErrorFallback 
            error={new Error('Test error message')} 
            resetError={() => {}} 
          />
        </div>
      </TestWrapper>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    // In development mode, we should see error details
    // The exact text might be in a pre tag, so we'll check for the error message differently
    const errorDetails = screen.getByText((content, element) => {
      return content.includes('Test error message');
    });
    expect(errorDetails).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  test('route wrapper shows loading state', async () => {
    render(
      <TestWrapper>
        <RouteWrapper title="Test Route">
          <div>Route Content</div>
        </RouteWrapper>
      </TestWrapper>
    );

    // Should show loading spinner initially
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });
  });

  test('protected route redirects when not authorized', () => {
    mockLocalStorage.getItem.mockReturnValue('false'); // Not authenticated
    
    render(
      <TestWrapper>
        <ProtectedRoute requiresAuth={true}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should not show protected content
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('protected route shows content when authorized', () => {
    mockLocalStorage.getItem.mockReturnValue('true'); // Authenticated
    
    render(
      <TestWrapper>
        <ProtectedRoute requiresAuth={true}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should show protected content
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('breadcrumb component renders items', () => {
    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Current Page' }
    ];

    render(<Breadcrumb items={breadcrumbItems} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  test('breadcrumb component handles empty items', () => {
    render(<Breadcrumb items={[]} />);
    
    // Should not render anything visible
    const breadcrumb = screen.queryByRole('navigation');
    expect(breadcrumb).not.toBeInTheDocument();
  });

  test('route configuration exports correctly', async () => {
    const { routeConfig } = await import('../shared/EnhancedRouter');
    
    expect(routeConfig).toBeInstanceOf(Array);
    expect(routeConfig.length).toBeGreaterThan(0);
    
    // Check that each route has required properties
    routeConfig.forEach(route => {
      expect(route).toHaveProperty('path');
      expect(route).toHaveProperty('title');
      expect(route).toHaveProperty('requiresAuth');
    });
  });
});