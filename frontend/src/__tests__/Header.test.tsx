import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';

const MockedHeader = () => (
  <AuthProvider>
    <Header />
  </AuthProvider>
);

describe('Header Component', () => {
  it('renders the Skill Lobang logo', () => {
    render(<MockedHeader />);
    expect(screen.getByText('Skill Lobang')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<MockedHeader />);
    expect(screen.getByPlaceholderText('Search courses...')).toBeInTheDocument();
  });

  it('renders login and signup buttons when user is not authenticated', () => {
    render(<MockedHeader />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
});