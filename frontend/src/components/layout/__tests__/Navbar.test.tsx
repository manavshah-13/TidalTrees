import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../Navbar';

// Mock zustand auth store
vi.mock('../../../store/useAuthStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
  }),
}));

describe('Navbar Component', () => {
  const setActiveTabMock = vi.fn();
  const onOpenReportModalMock = vi.fn();
  const onOpenAuthModalMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand title and desktop navigation items', () => {
    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={setActiveTabMock}
        onOpenReportModal={onOpenReportModalMock}
        onOpenAuthModal={onOpenAuthModalMock}
      />
    );

    expect(screen.getAllByText('TidalTrees').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Community').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('AI Validation').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Leaderboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1);
  });

  it('calls setActiveTab when a navigation tab is clicked', () => {
    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={setActiveTabMock}
        onOpenReportModal={onOpenReportModalMock}
        onOpenAuthModal={onOpenAuthModalMock}
      />
    );

    const leaderboardButtons = screen.getAllByText('Leaderboard');
    fireEvent.click(leaderboardButtons[0]);
    expect(setActiveTabMock).toHaveBeenCalledWith('leaderboard');
  });

  it('calls onOpenReportModal when Report Incident CTA is clicked', () => {
    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={setActiveTabMock}
        onOpenReportModal={onOpenReportModalMock}
        onOpenAuthModal={onOpenAuthModalMock}
      />
    );

    const reportButtons = screen.getAllByText('Report Incident');
    fireEvent.click(reportButtons[0]);
    expect(onOpenReportModalMock).toHaveBeenCalled();
  });

  it('calls onOpenAuthModal when Sign In is clicked', () => {
    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={setActiveTabMock}
        onOpenReportModal={onOpenReportModalMock}
        onOpenAuthModal={onOpenAuthModalMock}
      />
    );

    const signInButtons = screen.getAllByText('Sign In');
    fireEvent.click(signInButtons[0]);
    expect(onOpenAuthModalMock).toHaveBeenCalled();
  });

  it('toggles mobile drawer when hamburger button is clicked', () => {
    render(
      <Navbar
        activeTab="dashboard"
        setActiveTab={setActiveTabMock}
        onOpenReportModal={onOpenReportModalMock}
        onOpenAuthModal={onOpenAuthModalMock}
      />
    );

    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton);

    const closeButton = screen.getByLabelText('Close menu');
    expect(closeButton).toBeInTheDocument();
  });
});
