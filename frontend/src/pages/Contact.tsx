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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

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

  return (
    <div className="page-root">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="badge-pill-emerald inline-flex items-center gap-1.5 mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>24/7 Coastal Dispatch & Inquiries</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Connect with TidalTrees Coordinators
          </h1>
          <p className="text-sm text-gray-300 mt-2 max-w-lg mx-auto">
            Report urgent incidents, request ranger patrol assistance, or partner with our participatory conservation network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Emergency & SMS Dispatch Info */}
          <div className="md:col-span-1 space-y-4">
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
                Send SMS format <code>REPORT [LOCATION] [DETAILS]</code> to our automated coastal gateway:
              </p>
              <div className="bg-black/40 border border-emerald-500/20 rounded p-2 text-center font-mono text-emerald-400 text-sm font-bold">
                +1 (800) 555-TIDAL
              </div>
            </div>

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

            <div className="contact-info-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Headquarters</h3>
                  <span className="text-[11px] text-teal-400">Coastal Science Lab</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Marine Ecology Research Division, Adani University Campus, Ahmedabad, Gujarat.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="contact-form-card">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-700/60 pb-3">
                <Mail className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Send Direct Dispatch Inquiry</h2>
              </div>

              {isSent ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white">Thank You for Reaching Out</h3>
                  <p className="text-sm text-gray-300 mt-1 max-w-sm mx-auto">
                    Your transmission has been saved to the TidalTrees platform. Our coordination desk will respond to your provided email address.
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="btn-secondary mt-6 text-xs"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Maya Patel"
                        className="styled-input"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="input-label">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="maya@conservation.org"
                        className="styled-input"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Coastal Patrol Collaboration / Anomaly Query"
                      className="styled-input"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="input-label">Message & Coordinates</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Please include details about your request, zone coordinates, or partnership proposal..."
                      className="styled-input resize-none"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 font-semibold mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
