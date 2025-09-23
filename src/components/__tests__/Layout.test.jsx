import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Layout from '../Layout';

// Mock the components
jest.mock('../Header', () => {
  return function Header() {
    return <div data-testid="header">Header Component</div>;
  };
});

jest.mock('../BottomNavigation', () => {
  return function BottomNavigation() {
    return <div data-testid="bottom-navigation">Bottom Navigation</div>;
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

const renderWithRouter = (component) => {
  return render(component, { wrapper: BrowserRouter });
};

describe('Layout Component', () => {
  const TestChild = () => <div data-testid="test-child">Test Content</div>;

  test('renders children content', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('shows header on home page', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.queryByTestId('bottom-navigation')).not.toBeInTheDocument();
  });

  test('shows bottom navigation but hides header on dashboard pages', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  test('shows bottom navigation but hides header on trip-planner pages', () => {
    useLocation.mockReturnValue({ pathname: '/trip-planner' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  test('shows both header and bottom navigation on trip pages', () => {
    useLocation.mockReturnValue({ pathname: '/trip/active' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  test('shows both header and bottom navigation on data pages', () => {
    useLocation.mockReturnValue({ pathname: '/data/analytics' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  test('shows both header and bottom navigation on rewards pages', () => {
    useLocation.mockReturnValue({ pathname: '/rewards' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  test('shows both header and bottom navigation on profile pages', () => {
    useLocation.mockReturnValue({ pathname: '/profile' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  test('shows both header and bottom navigation on settings pages', () => {
    useLocation.mockReturnValue({ pathname: '/settings' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  test('shows both header and bottom navigation on SOS pages', () => {
    useLocation.mockReturnValue({ pathname: '/sos' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  test('shows both header and bottom navigation on discover pages', () => {
    useLocation.mockReturnValue({ pathname: '/discover' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  test('shows header on learn more page', () => {
    useLocation.mockReturnValue({ pathname: '/learn-more' });
    
    renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.queryByTestId('bottom-navigation')).not.toBeInTheDocument();
  });

  test('has correct CSS classes for layout structure', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    
    const { container } = renderWithRouter(
      <Layout>
        <TestChild />
      </Layout>
    );
    
    const layoutDiv = container.firstChild;
    expect(layoutDiv).toHaveClass('min-h-screen', 'flex', 'flex-col');
  });
});