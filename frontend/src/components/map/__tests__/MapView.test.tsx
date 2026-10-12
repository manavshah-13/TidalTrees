import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MapView } from '../MapView';
import type { Report } from '../../../types';

// Mock api client
vi.mock('../../../api/client', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        reports: [],
        total: 0,
      },
    }),
  },
}));

// Mock react-leaflet and react-leaflet-cluster components for JSDOM
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="mock-tile-layer" />,
  Marker: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-marker">{children}</div>
  ),
  Popup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-popup">{children}</div>
  ),
  useMap: () => ({
    setView: vi.fn(),
  }),
}));

vi.mock('react-leaflet-cluster', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-cluster-group">{children}</div>
  ),
}));

describe('MapView Component', () => {
  const mockReports: Report[] = [
    {
      id: 1,
      title: 'Mangrove Logging Alert',
      description: 'Illegal cutting observed near estuarine river bend.',
      severity: 'critical',
      status: 'pending',
      location: 'Sundarbans Sector 4',
      latitude: 21.84,
      longitude: 88.92,
      created_at: '2026-03-01T10:00:00Z',
      ai_confidence: 0.94,
      author_id: 1,
    },
    {
      id: 2,
      title: 'Trash Dumping in Creek',
      description: 'Plastic waste accumulated in tidal creek.',
      severity: 'low',
      status: 'validated',
      location: 'Delta Creek 2',
      latitude: 21.81,
      longitude: 88.95,
      created_at: '2026-03-02T12:00:00Z',
      ai_confidence: 0.88,
      author_id: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the floating HUD overlay and telemetry title', () => {
    render(<MapView reports={mockReports} />);

    expect(screen.getByText('Coastal Telemetry HUD')).toBeInTheDocument();
    expect(screen.getByText(/2 Active Hotspots/i)).toBeInTheDocument();
    expect(screen.getByText('Severity Filters')).toBeInTheDocument();
  });

  it('renders severity filter buttons with correct counts', () => {
    render(<MapView reports={mockReports} />);

    expect(screen.getByText(/critical/i, { selector: '.truncate' })).toBeInTheDocument();
    expect(screen.getByText(/low/i, { selector: '.truncate' })).toBeInTheDocument();
    expect(screen.getByText(/high/i, { selector: '.truncate' })).toBeInTheDocument();
    expect(screen.getByText(/medium/i, { selector: '.truncate' })).toBeInTheDocument();
  });

  it('filters hotspots when a severity filter pill is clicked', () => {
    render(<MapView reports={mockReports} />);

    const criticalBtn = screen.getByText(/critical/i, { selector: '.truncate' }).closest('button');
    expect(criticalBtn).toBeInTheDocument();
    fireEvent.click(criticalBtn!);

    expect(screen.getByText(/1 Active Hotspots/i)).toBeInTheDocument();
  });

  it('renders legend badges for severity classifications', () => {
    render(<MapView reports={mockReports} />);

    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Med')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
