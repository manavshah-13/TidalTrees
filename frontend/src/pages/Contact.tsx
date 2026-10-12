import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  MapPin,
  CheckCircle2,
  Loader2,
  Radio,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const containerRef = useScrollReveal<HTMLDivElement>();

  const coordinates = '23.0768° N, 72.5367° E (Gulf of Khambhat HQ)';

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(coordinates);
    setIsCopied(true);
    toast.success('Coordinates copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please complete all form fields');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Sending your message to coastal response team...');

    try {
      await api.post('/api/contact', formData);
      toast.success('Inquiry delivered! Coastal dispatch will reply shortly.', {
        id: toastId,
        duration: 5000,
      });
      setIsSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to submit inquiry. Please try again.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const partners = [
    { name: 'Global Mangrove Watch', tag: 'Satellite Monitoring' },
    { name: 'Coastal Guard Alliance', tag: 'Field Dispatch' },
    { name: 'Blue Carbon Initiative', tag: 'Restoration Finance' },
    { name: 'IUCN Mangrove Group', tag: 'Biodiversity Standards' },
  ];

  return (
    <div className="page-root" ref={containerRef}>
      <div className="max-w-5xl mx-auto">
        {/* Title Header */}
        <div className="text-center mb-10 reveal">
          <div className="badge-pill-emerald inline-flex items-center gap-1.5 mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>24/7 Coastal Dispatch & Inquiries</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Connect with TidalTrees Coordinators
          </h1>
          <p className="text-sm text-gray-300 mt-2 max-w-lg mx-auto">
            Report urgent incidents, request ranger patrol assistance, or partner with our participatory conservation network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
          {/* Emergency & SMS Dispatch Info Column */}
          <div className="md:col-span-5 space-y-4 reveal reveal-delay-1">
            {/* SMS Hotline Card */}
            <div className="contact-info-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">SMS Incident Hotline</h3>
                  <span className="text-[11px] text-emerald-400">For Low-Bandwidth Fishers</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                Send SMS format <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">REPORT [LOCATION] [DETAILS]</code> to our automated coastal gateway:
              </p>
              <div className="bg-black/50 border border-emerald-500/30 rounded-lg p-2.5 text-center font-mono text-emerald-400 text-sm font-bold tracking-wider">
                +1 (800) 555-TIDAL
              </div>
            </div>

            {/* Response Time Card */}
            <div className="contact-info-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Response Time</h3>
                  <span className="text-[11px] text-cyan-400">Rapid Patrol Dispatch</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Critical threat notifications trigger field verification alerts to local community rangers within 15 minutes.
              </p>
            </div>

            {/* 3. Location & Dispatch Map Preview Card */}
            <div className="contact-info-card overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <h3 className="font-bold text-white text-sm">Field Headquarters</h3>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCoordinates}
                  className="text-[11px] flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20 cursor-pointer transition-colors"
                >
                  {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Copy GPS'}</span>
                </button>
              </div>

              {/* Graphical GPS coordinates preview */}
              <div className="p-3 rounded-lg bg-black/50 border border-teal-500/20 mb-3 font-mono text-xs text-emerald-300 flex items-center justify-between">
                <span>{coordinates}</span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Marine Ecology Research Division, Adani University Coastal Delta Hub, Gujarat.
              </p>
            </div>
          </div>

          {/* 1. Contact Form with Floating Label Inputs */}
          <div className="md:col-span-7 reveal reveal-delay-2">
            <div className="contact-form-card">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-700/60 pb-3">
                <Mail className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Send Direct Dispatch Inquiry</h2>
              </div>

              {isSent ? (
                <div className="text-center py-10 animate-slide-up">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Inquiry Successfully Dispatched</h3>
                  <p className="text-sm text-gray-300 mt-2 max-w-sm mx-auto leading-relaxed">
                    Your transmission has been permanently logged to the TidalTrees dispatch queue. Our regional coastal operations coordinator will respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="btn-secondary mt-6 text-xs"
                  >
                    Send Another Transmission
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Floating Label: Full Name */}
                    <div className="floating-label-group">
                      <input
                        type="text"
                        id="contact-name"
                        required
                        placeholder=" "
                        className="floating-input"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                      <label htmlFor="contact-name" className="floating-label">
                        Full Name
                      </label>
                    </div>

                    {/* Floating Label: Email Address */}
                    <div className="floating-label-group">
                      <input
                        type="email"
                        id="contact-email"
                        required
                        placeholder=" "
                        className="floating-input"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                      <label htmlFor="contact-email" className="floating-label">
                        Email Address
                      </label>
                    </div>
                  </div>

                  {/* Floating Label: Subject */}
                  <div className="floating-label-group">
                    <input
                      type="text"
                      id="contact-subject"
                      required
                      placeholder=" "
                      className="floating-input"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                    <label htmlFor="contact-subject" className="floating-label">
                      Inquiry Subject
                    </label>
                  </div>

                  {/* Floating Label: Message */}
                  <div className="floating-label-group">
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      placeholder=" "
                      className="floating-input resize-none pt-4"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                    <label htmlFor="contact-message" className="floating-label">
                      Message & Coordinates Details
                    </label>
                  </div>

                  {/* 2. Interactive Submission Feedback Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 font-semibold mt-2 cursor-pointer transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Dispatching to Coastal Network...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-emerald-200" />
                        <span>Send Transmission</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 4. Partner & Trust Section */}
        <div className="pt-8 border-t border-emerald-500/15 reveal reveal-delay-3">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400/90 block mb-1">
              Trusted Alliances & Scientific Coalitions
            </span>
            <p className="text-xs text-gray-400">
              Coordinating coastal resilience, satellite radar validation, and mangrove protection worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gradient-to-b from-[#081f22]/80 to-[#041013]/80 border border-emerald-500/20 text-center hover:border-emerald-500/40 transition-all"
              >
                <div className="text-sm font-bold text-white mb-1">{partner.name}</div>
                <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                  {partner.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
