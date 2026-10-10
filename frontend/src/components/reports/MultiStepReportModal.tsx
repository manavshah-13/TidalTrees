import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  MapPin,
  FileText,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import type { SeverityType, Report } from '../../types';

interface MultiStepReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: (report: Report) => void;
}

interface FormData {
  title: string;
  description: string;
  severity: SeverityType;
  location: string;
  latitude: string;
  longitude: string;
  imagePreview: string | null;
}

const initialFormState: FormData = {
  title: '',
  description: '',
  severity: 'medium',
  location: '',
  latitude: '',
  longitude: '',
  imagePreview: null,
};

export const MultiStepReportModal: React.FC<MultiStepReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated,
}) => {
  const { isAuthenticated, user, updateUserPoints } = useAuthStore();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.location.trim()) {
      newErrors.location = 'Location name / landmark is required';
    }

    if (formData.latitude && isNaN(Number(formData.latitude))) {
      newErrors.latitude = 'Latitude must be a valid number';
    }
    if (formData.longitude && isNaN(Number(formData.longitude))) {
      newErrors.longitude = 'Longitude must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setErrors({});
      setStep(step - 1);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    const toastId = toast.loading('Detecting coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success('GPS coordinates acquired!', { id: toastId });
      },
      (err) => {
        toast.error(`Could not detect location: ${err.message}`, { id: toastId });
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imagePreview: reader.result as string }));
        toast.success('Image attached successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first to submit an incident report');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting report to AI verification pipeline...');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        severity: formData.severity,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const res = await api.post<Report>('/api/reports', payload);
      toast.success('Incident reported! +25 Conservation Points awarded 🎉', {
        id: toastId,
        duration: 5000,
      });

      // Update local points
      if (user) {
        updateUserPoints((user.points || 0) + 25, (user.reports_count || 0) + 1);
      }

      if (onReportCreated) {
        onReportCreated(res.data);
      }

      // Reset and close
      setFormData(initialFormState);
      setStep(1);
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to submit report. Please check input parameters.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="icon-badge-emerald">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Report Mangrove Incident
              </h2>
              <p className="text-xs text-emerald-300/80">
                Participatory Coastal Monitoring & AI Validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="close-button"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Visual Progress Steps */}
        <div className="steps-indicator-container">
          {[
            { num: 1, label: 'Incident Details', icon: FileText },
            { num: 2, label: 'Location & Media', icon: MapPin },
            { num: 3, label: 'Review & Submit', icon: CheckCircle2 },
          ].map((item, idx) => (
            <React.Fragment key={item.num}>
              <div
                className={`step-item ${
                  step === item.num
                    ? 'step-active'
                    : step > item.num
                    ? 'step-completed'
                    : 'step-pending'
                }`}
              >
                <div className="step-circle">
                  {step > item.num ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span>{item.num}</span>
                  )}
                </div>
                <span className="step-label">{item.label}</span>
              </div>
              {idx < 2 && (
                <div
                  className={`step-connector ${
                    step > item.num ? 'connector-completed' : ''
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Modal Body / Step Content */}
        <div className="modal-body">
          {/* STEP 1: Incident Details */}
          {step === 1 && (
            <div className="step-content space-y-4">
              <div>
                <label className="input-label">
                  Incident Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Unlawful mangrove logging spotted near Delta creek"
                  className={`styled-input ${errors.title ? 'input-error' : ''}`}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                {errors.title && (
                  <p className="error-hint">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="input-label">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe observed activities, equipment, damage scale, and surrounding environment..."
                  className={`styled-input resize-none ${
                    errors.description ? 'input-error' : ''
                  }`}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                {errors.description && (
                  <p className="error-hint">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="input-label">
                  Threat Severity <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as SeverityType[]).map(
                    (sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setFormData({ ...formData, severity: sev })}
                        className={`severity-pill ${
                          formData.severity === sev ? `severity-active-${sev}` : ''
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                        <span className="capitalize">{sev}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Media */}
          {step === 2 && (
            <div className="step-content space-y-4">
              <div>
                <label className="input-label">
                  Location Name / Landmark <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sector 7 North Estuary, Sundarbans"
                  className={`styled-input ${errors.location ? 'input-error' : ''}`}
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
                {errors.location && (
                  <p className="error-hint">{errors.location}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Latitude</label>
                  <input
                    type="text"
                    placeholder="21.9497"
                    className={`styled-input ${errors.latitude ? 'input-error' : ''}`}
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                  {errors.latitude && (
                    <p className="error-hint">{errors.latitude}</p>
                  )}
                </div>
                <div>
                  <label className="input-label">Longitude</label>
                  <input
                    type="text"
                    placeholder="89.1833"
                    className={`styled-input ${errors.longitude ? 'input-error' : ''}`}
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                  {errors.longitude && (
                    <p className="error-hint">{errors.longitude}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Auto-Detect GPS Coordinates</span>
              </button>

              <div>
                <label className="input-label">Evidence Media (Photo/Observation)</label>
                <div className="upload-dropzone">
                  <input
                    type="file"
                    accept="image/*"
                    id="evidence-file"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="evidence-file"
                    className="cursor-pointer flex flex-col items-center justify-center p-4 text-center"
                  >
                    {formData.imagePreview ? (
                      <div className="relative w-full flex flex-col items-center">
                        <img
                          src={formData.imagePreview}
                          alt="Evidence preview"
                          className="h-32 object-cover rounded-lg border border-emerald-500/30 mb-2"
                        />
                        <span className="text-xs text-emerald-400 hover:underline">
                          Click to replace image
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-emerald-400/70 mb-2" />
                        <span className="text-sm font-medium text-gray-200">
                          Click or drag photo here
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WEBP up to 5MB
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="step-content space-y-4">
              <div className="review-summary-card">
                <div className="flex justify-between items-start border-b border-gray-700/60 pb-3">
                  <div>
                    <h3 className="font-semibold text-white text-base">
                      {formData.title}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {formData.location}
                      {formData.latitude &&
                        ` (${formData.latitude}, ${formData.longitude})`}
                    </p>
                  </div>
                  <span
                    className={`severity-badge severity-${formData.severity} uppercase text-xs font-bold`}
                  >
                    {formData.severity}
                  </span>
                </div>

                <div className="py-3 text-sm text-gray-300 leading-relaxed border-b border-gray-700/60">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium mb-1">
                    Description
                  </span>
                  {formData.description}
                </div>

                {formData.imagePreview && (
                  <div className="pt-3">
                    <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium mb-2">
                      Attached Photographic Evidence
                    </span>
                    <img
                      src={formData.imagePreview}
                      alt="Review evidence"
                      className="w-full h-36 object-cover rounded-md border border-emerald-500/20"
                    />
                  </div>
                )}
              </div>

              {/* AI Verification Banner */}
              <div className="ai-notice-card">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-200/90 leading-tight">
                  Upon submission, your incident will undergo immediate automated satellite
                  spectral validation and community review. You will receive <strong>25 Conservation Points</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Buttons */}
        <div className="modal-footer">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="btn-secondary flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Submit Report</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
