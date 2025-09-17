import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Header from '../Header';

// Mock the hooks and components
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('../notifications', () => ({
  useNotifications: () => ({
    unreadCount: 0,
  }),
  NotificationCenter: ({ isOpen, onClose }) => (
    isOpen ? <div data-testid="notification-center" onClick={onClose}>Notification Center</div> : null
  ),
}));

jest.mock('../shared/ThemeToggle', () => {
  return function ThemeToggle() {
    return <button data-testid="theme-toggle">Theme Toggle</button>;
  };
});

const renderWithRouter = (component, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(component, { wrapper: BrowserRouter });
};

describe('Header Component', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ pathname: '/' });
  });

  test('renders NATPAC logo and title', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('NATPAC')).toBeInTheDocument();
    expect(screen.getByText('Travel Data Collection')).toBeInTheDocument();
  });

  test('shows notification bell with unread count', () => {
    // Mock useNotifications to return unread count
    jest.doMock('../notifications', () => ({
      useNotifications: () => ({
        unreadCount: 3,
      }),
      NotificationCenter: ({ isOpen, onClose }) => (
        isOpen ? <div data-testid="notification-center" onClick={onClose}>Notification Center</div> : null
      ),
    }));

    renderWithRouter(<Header />);
    const bellButton = screen.getByLabelText('Notifications');
    expect(bellButton).toBeInTheDocument();
  });

  test('shows back button on non-home routes', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<Header />, { route: '/dashboard' });
    const backButton = screen.getByLabelText('Go back');
    expect(backButton).toBeInTheDocument();
  });

  test('does not show back button on home route', () => {
    useLocation.mockReturnValue({ pathname: '/' });
    
    renderWithRouter(<Header />);
    const backButton = screen.queryByLabelText('Go back');
    expect(backButton).not.toBeInTheDocument();
  });

  test('opens notification center when bell is clicked', () => {
    renderWithRouter(<Header />);
    
    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);
    
    expect(screen.getByTestId('notification-center')).toBeInTheDocument();
  });

  test('closes notification center when clicked', () => {
    renderWithRouter(<Header />);
    
    // Open notification center
    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);
    
    // Close notification center
    const notificationCenter = screen.getByTestId('notification-center');
    fireEvent.click(notificationCenter);
    
    expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
  });

  test('renders theme toggle component', () => {
    renderWithRouter(<Header />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('handles back button click', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    const mockBack = jest.fn();
    window.history.back = mockBack;
    
    renderWithRouter(<Header />, { route: '/dashboard' });
    
    const backButton = screen.getByLabelText('Go back');
    fireEvent.click(backButton);
    
    expect(mockBack).toHaveBeenCalled();
  });
});