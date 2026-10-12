import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Contact } from '../Contact';
import { api } from '../../api/client';

// Mock api client
vi.mock('../../api/client', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('Contact Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact information, headline, and partner strip', () => {
    render(<Contact />);

    expect(screen.getByText(/Connect with TidalTrees Coordinators/i)).toBeInTheDocument();
    expect(screen.getByText('+1 (800) 555-TIDAL')).toBeInTheDocument();
    expect(screen.getByText(/Field Headquarters/i)).toBeInTheDocument();
    expect(screen.getByText('Global Mangrove Watch')).toBeInTheDocument();
    expect(screen.getByText('Coastal Guard Alliance')).toBeInTheDocument();
  });

  it('renders floating label form inputs', () => {
    render(<Contact />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Inquiry Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message & Coordinates Details/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Transmission/i })).toBeInTheDocument();
  });

  it('successfully submits inquiry and renders confirmation state', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'Inquiry received' } });

    render(<Contact />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Captain Nemo' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'nemo@nautilus.org' },
    });
    fireEvent.change(screen.getByLabelText(/Inquiry Subject/i), {
      target: { value: 'Illegal trawler in Sundarbans' },
    });
    fireEvent.change(screen.getByLabelText(/Message & Coordinates Details/i), {
      target: { value: 'Spotted timber clearing at 21.85N, 88.92E' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Transmission/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/contact', {
        name: 'Captain Nemo',
        email: 'nemo@nautilus.org',
        subject: 'Illegal trawler in Sundarbans',
        message: 'Spotted timber clearing at 21.85N, 88.92E',
      });
    });

    expect(await screen.findByText(/Inquiry Successfully Dispatched/i)).toBeInTheDocument();
  });
});
