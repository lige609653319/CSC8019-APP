import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoyaltyClubSection from '../components/LoyaltyClubSection';

// Mock lucide-react to avoid issues with SVG rendering in tests if any
vi.mock('lucide-react', () => ({
  Gift: () => <div data-testid="gift-icon" />,
  User: () => <div data-testid="user-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
}));

describe('LoyaltyClubSection Component', () => {
  it('renders the username correctly', () => {
    render(<LoyaltyClubSection username="Test User" />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders the points balance', () => {
    const balance = { pointsBalance: 150 };
    render(<LoyaltyClubSection balance={balance} />);
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('pts')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<LoyaltyClubSection loading={true} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<LoyaltyClubSection error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});
