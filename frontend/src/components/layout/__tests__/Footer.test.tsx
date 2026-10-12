import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from '../Footer';
import toast from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Footer Component', () => {
  const onNavigateTabMock = vi.fn();
  const onOpenReportModalMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all four columns and bottom hackathon badge', () => {
    render(
      <Footer
        onNavigateTab={onNavigateTabMock}
        onOpenReportModal={onOpenReportModalMock}
      />
    );

    // Column 1: Brand & Stewardship
    expect(screen.getAllByText('TidalTrees').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Empowering coastal communities through automated spectral monitoring/i)).toBeInTheDocument();

    // Column 2: Platform Navigation
    expect(screen.getByText('Platform Navigation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Community Hub')).toBeInTheDocument();
    expect(screen.getByText('AI Validation Studio')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Field Patrol Map')).toBeInTheDocument();

    // Column 3: Ecosystem Resources
    expect(screen.getByText('Ecosystem Resources')).toBeInTheDocument();
    expect(screen.getByText('About Mangroves (Ecology)')).toBeInTheDocument();
    expect(screen.getByText('Incident Reporting Standards')).toBeInTheDocument();
    expect(screen.getByText('API Documentation')).toBeInTheDocument();
    expect(screen.getByText('Ranger Guidelines')).toBeInTheDocument();

    // Column 4: Newsletter
    expect(screen.getByText('Coastal Dispatch')).toBeInTheDocument();
    expect(screen.getByText(/Get weekly satellite alerts/i)).toBeInTheDocument();

    // Bottom Bar
    expect(screen.getByText(/HackOut 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it('calls onNavigateTab when platform navigation items are clicked', () => {
    render(
      <Footer
        onNavigateTab={onNavigateTabMock}
        onOpenReportModal={onOpenReportModalMock}
      />
    );

    const communityBtn = screen.getByText('Community Hub');
    fireEvent.click(communityBtn);
    expect(onNavigateTabMock).toHaveBeenCalledWith('community');
  });

  it('handles newsletter subscription and triggers toast', () => {
    render(
      <Footer
        onNavigateTab={onNavigateTabMock}
        onOpenReportModal={onOpenReportModalMock}
      />
    );

    const input = screen.getByPlaceholderText('ranger@coastalguard.org');
    const subscribeBtn = screen.getByText('Subscribe');

    fireEvent.change(input, { target: { value: 'guardian@tidal.org' } });
    fireEvent.click(subscribeBtn);

    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('Subscribed! Weekly satellite canopy alerts will be dispatched to guardian@tidal.org')
    );
  });

  it('triggers error toast when subscribing with invalid email', () => {
    render(
      <Footer
        onNavigateTab={onNavigateTabMock}
        onOpenReportModal={onOpenReportModalMock}
      />
    );

    const input = screen.getByPlaceholderText('ranger@coastalguard.org');
    const subscribeBtn = screen.getByText('Subscribe');

    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.click(subscribeBtn);

    expect(toast.error).toHaveBeenCalledWith('Please enter a valid email address');
  });
});
