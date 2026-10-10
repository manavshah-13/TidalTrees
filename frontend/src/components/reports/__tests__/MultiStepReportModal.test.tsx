import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiStepReportModal } from '../MultiStepReportModal';

// Mock zustand auth store
vi.mock('../../../store/useAuthStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    user: { id: 1, username: 'testguardian', points: 100, reports_count: 3 },
    updateUserPoints: vi.fn(),
  }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('MultiStepReportModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <MultiStepReportModal isOpen={false} onClose={onCloseMock} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders Step 1 (Incident Details) by default when isOpen is true', () => {
    render(<MultiStepReportModal isOpen={true} onClose={onCloseMock} />);
    expect(screen.getByText('Report Mangrove Incident')).toBeInTheDocument();
    expect(screen.getByText('Incident Title')).toBeInTheDocument();
    expect(screen.getByText('Detailed Description')).toBeInTheDocument();
    expect(screen.getByText('Next Step')).toBeInTheDocument();
  });

  it('triggers validation errors when advancing Step 1 without input', () => {
    render(<MultiStepReportModal isOpen={true} onClose={onCloseMock} />);
    const nextBtn = screen.getByText('Next Step');
    fireEvent.click(nextBtn);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });

  it('navigates to Step 2 when Step 1 is valid, and allows navigating back', () => {
    render(<MultiStepReportModal isOpen={true} onClose={onCloseMock} />);

    // Fill valid Step 1 inputs
    const titleInput = screen.getByPlaceholderText(/e.g., Unlawful mangrove logging/i);
    const descInput = screen.getByPlaceholderText(/Describe observed activities/i);

    fireEvent.change(titleInput, { target: { value: 'Illegal Felling Spotted' } });
    fireEvent.change(descInput, { target: { value: 'Detailed description of logging machinery in creek' } });

    // Click Next Step
    const nextBtn = screen.getByText('Next Step');
    fireEvent.click(nextBtn);

    // Should now be on Step 2
    expect(screen.getByText('Location Name / Landmark')).toBeInTheDocument();
    expect(screen.getByText('Auto-Detect GPS Coordinates')).toBeInTheDocument();

    // Click Back
    const backBtn = screen.getByText('Back');
    fireEvent.click(backBtn);

    // Should be back on Step 1 with input retained
    expect(screen.getByText('Incident Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Illegal Felling Spotted')).toBeInTheDocument();
  });
});
