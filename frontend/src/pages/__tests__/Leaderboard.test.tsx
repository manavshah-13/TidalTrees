import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Leaderboard } from '../Leaderboard';
import { api } from '../../api/client';

// Mock api client
vi.mock('../../api/client', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('Leaderboard Page Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders cached indicator when response has cached: true', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        leaderboard: [
          { id: 1, username: 'sentinel_alpha', points: 350, reports_count: 14 },
          { id: 2, username: 'ranger_bravo', points: 200, reports_count: 8 },
        ],
        cached: true,
        total: 2,
      },
    });

    render(<Leaderboard />);

    expect(await screen.findByText('Mangrove Guardian Leaderboard')).toBeInTheDocument();
    expect(await screen.findByText(/Redis Accelerated/i)).toBeInTheDocument();
    const alphaMatches = await screen.findAllByText('sentinel_alpha');
    expect(alphaMatches.length).toBeGreaterThan(0);
    const bravoMatches = await screen.findAllByText('ranger_bravo');
    expect(bravoMatches.length).toBeGreaterThan(0);
  });

  it('renders live database query indicator when cached: false', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        leaderboard: [
          { id: 1, username: 'coastal_warden', points: 150, reports_count: 6 },
        ],
        cached: false,
        total: 1,
      },
    });

    render(<Leaderboard />);

    expect(await screen.findByText('Mangrove Guardian Leaderboard')).toBeInTheDocument();
    expect(await screen.findByText(/Live Database Query/i)).toBeInTheDocument();
    const wardenMatches = await screen.findAllByText('coastal_warden');
    expect(wardenMatches.length).toBeGreaterThan(0);
  });
});
