import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AiValidation } from '../AiValidation';
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

// Mock URL.createObjectURL and URL.revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url');
globalThis.URL.revokeObjectURL = vi.fn();

describe('AiValidation Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and dropzone prompt', () => {
    render(<AiValidation />);

    expect(screen.getByText('AI Vision Threat Validation')).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop your mangrove image here/i)).toBeInTheDocument();
    expect(screen.getByText('Validate with Gemini Vision')).toBeInTheDocument();
  });

  it('alerts when submitting without selecting an image', () => {
    render(<AiValidation />);

    const submitBtn = screen.getByRole('button', { name: /Validate with Gemini Vision/i });
    expect(submitBtn).toBeDisabled();
  });

  it('handles image file selection and runs spectral analysis', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        confidence: 0.96,
        tags: ['Canopy Dieback', 'Salinity Stress'],
        threat_level: 'critical',
        summary: 'Severe chlorophyl degradation observed in sector B-12.',
        recommended_action: 'Deploy warden patrol for sediment sampling.',
      },
    });

    const { container } = render(<AiValidation />);

    const file = new File(['fake-image-bytes'], 'canopy.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput!, { target: { files: [file] } });

    expect(await screen.findByText('canopy.jpg')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Validate with Gemini Vision/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    expect(await screen.findByText(/Habitat Telemetry Output/i)).toBeInTheDocument();
    expect(screen.getByText(/Severe chlorophyl degradation/i)).toBeInTheDocument();
    expect(await screen.findByText('96.0%')).toBeInTheDocument();
  });
});
