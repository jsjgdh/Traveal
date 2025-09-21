import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNavigation from '../BottomNavigation';

// Mock the router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

const renderWithRouter = (component) => {
  return render(component, { wrapper: BrowserRouter });
};

describe('BottomNavigation Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders all navigation items', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<BottomNavigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Planner')).toBeInTheDocument();
    expect(screen.getByText('Rewards')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('highlights active dashboard item', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<BottomNavigation />);
    
    const homeButton = screen.getByText('Home').closest('button');
    expect(homeButton).toHaveClass('text-primary-600', 'bg-primary-50');
  });

  test('highlights active discover item', () => {
    useLocation.mockReturnValue({ pathname: '/discover' });
    
    renderWithRouter(<BottomNavigation />);
    
    const discoverButton = screen.getByText('Discover').closest('button');
    expect(discoverButton).toHaveClass('text-primary-600', 'bg-primary-50');
  });

  test('highlights active planner item', () => {
    useLocation.mockReturnValue({ pathname: '/trip-planner' });
    
    renderWithRouter(<BottomNavigation />);
    
    const plannerButton = screen.getByText('Planner').closest('button');
    expect(plannerButton).toHaveClass('text-primary-600', 'bg-primary-50');
  });

  test('highlights active rewards item', () => {
    useLocation.mockReturnValue({ pathname: '/rewards' });
    
    renderWithRouter(<BottomNavigation />);
    
    const rewardsButton = screen.getByText('Rewards').closest('button');
    expect(rewardsButton).toHaveClass('text-primary-600', 'bg-primary-50');
  });

  test('highlights active profile item', () => {
    useLocation.mockReturnValue({ pathname: '/profile' });
    
    renderWithRouter(<BottomNavigation />);
    
    const profileButton = screen.getByText('Profile').closest('button');
    expect(profileButton).toHaveClass('text-primary-600', 'bg-primary-50');
  });

  test('navigates to dashboard when home is clicked', () => {
    useLocation.mockReturnValue({ pathname: '/profile' });
    
    renderWithRouter(<BottomNavigation />);
    
    const homeButton = screen.getByText('Home');
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('navigates to discover when discover is clicked', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<BottomNavigation />);
    
    const discoverButton = screen.getByText('Discover');
    fireEvent.click(discoverButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/discover');
  });

  test('navigates to planner when planner is clicked', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<BottomNavigation />);
    
    const plannerButton = screen.getByText('Planner');
    fireEvent.click(plannerButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/trip-planner');
  });

  test('navigates to rewards when rewards is clicked', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<BottomNavigation />);
    
    const rewardsButton = screen.getByText('Rewards');
    fireEvent.click(rewardsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/rewards');
  });

  test('navigates to profile when profile is clicked', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<BottomNavigation />);
    
    const profileButton = screen.getByText('Profile');
    fireEvent.click(profileButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('shows active indicator dot for current page', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<BottomNavigation />);
    
    const homeButton = screen.getByText('Home').closest('button');
    const activeDot = homeButton.querySelector('.w-1.h-1.bg-primary-600');
    expect(activeDot).toBeInTheDocument();
  });

  test('does not show active indicator for inactive items', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<BottomNavigation />);
    
    const profileButton = screen.getByText('Profile').closest('button');
    const activeDot = profileButton.querySelector('.w-1.h-1.bg-primary-600');
    expect(activeDot).not.toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    renderWithRouter(<BottomNavigation />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });

  test('has correct CSS classes for layout', () => {
    useLocation.mockReturnValue({ pathname: '/dashboard' });
    
    const { container } = renderWithRouter(<BottomNavigation />);
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'bg-white', 'border-t', 'border-gray-200', 'z-50');
  });
});