import React, { useState } from 'react';
import {
  Trees,
  Send,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Compass,
  Heart,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FooterProps {
  onNavigateTab?: (tab: string) => void;
  onOpenReportModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onOpenReportModal,
}) => {
  const [email, setEmail] = useState<string>('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    toast.success(`Subscribed! Weekly satellite canopy alerts will be dispatched to ${email.trim()}`);
    setEmail('');
  };

  const handleNav = (tabId: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMapNav = () => {
    if (onNavigateTab) {
      onNavigateTab('dashboard');
      setTimeout(() => {
        const mapEl = document.getElementById('map-section');
        if (mapEl) {
          mapEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 500, behavior: 'smooth' });
        }
      }, 150);
    }
  };

  return (
    <footer className="footer-root">
      <div className="footer-container">
        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          {/* Column 1: Brand & Stewardship Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="brand-logo-glow !w-9 !h-9">
                <Trees className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">TidalTrees</span>
                <span className="text-[10px] text-emerald-400 block font-mono">Coastal Sentinel Network</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Empowering coastal communities through automated spectral monitoring, community patrol dispatch, and blue carbon conservation.
            </p>

            {/* Social Icon Links */}
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                Connect With Guardians
              </div>
              <div className="flex items-center gap-2.5">
                {/* GitHub */}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="GitHub Organization"
                  aria-label="GitHub"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="Twitter / X"
                  aria-label="Twitter / X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Discord */}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="Discord Community"
                  aria-label="Discord"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.079.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="LinkedIn Network"
                  aria-label="LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div>
            <h3 className="footer-column-title">Platform Navigation</h3>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('dashboard')}
                  className="footer-link flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('community')}
                  className="footer-link flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Community Hub</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('ai-validation')}
                  className="footer-link flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>AI Validation Studio</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('leaderboard')}
                  className="footer-link flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Leaderboard</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleMapNav}
                  className="footer-link flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Field Patrol Map</span>
                </button>
              </li>
              {onOpenReportModal && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenReportModal}
                    className="footer-link flex items-center gap-1.5 text-emerald-400 font-semibold group mt-2"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    <span>+ File Incident Report</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Ecosystem Resources */}
          <div>
            <h3 className="footer-column-title">Ecosystem Resources</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="#ecology"
                  onClick={(e) => {
                    e.preventDefault();
                    toast('Mangrove roots sequester up to 4x more carbon than tropical rainforests 🌿', {
                      icon: '🌊',
                    });
                  }}
                  className="footer-link flex items-center gap-1.5 group"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400 group-hover:text-emerald-400 transition-colors" />
                  <span>About Mangroves (Ecology)</span>
                </a>
              </li>
              <li>
                <a
                  href="#standards"
                  onClick={(e) => {
                    e.preventDefault();
                    toast('ISO 14064 & Verra VM0033 Blue Carbon standards adhered to.', {
                      icon: '📋',
                    });
                  }}
                  className="footer-link flex items-center gap-1.5 group"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 group-hover:text-emerald-400 transition-colors" />
                  <span>Incident Reporting Standards</span>
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link flex items-center gap-1.5 group"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover:text-emerald-400 transition-colors" />
                  <span>API Documentation</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 font-mono">
                    FastAPI
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#guidelines"
                  onClick={(e) => {
                    e.preventDefault();
                    toast('Ranger Protocol: Geotag incident, capture canopy angle, alert local warden.', {
                      icon: '🛡️',
                    });
                  }}
                  className="footer-link flex items-center gap-1.5 group"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400 group-hover:text-emerald-400 transition-colors" />
                  <span>Ranger Guidelines</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Coastal Dispatch Dispatcher / Newsletter */}
          <div>
            <h3 className="footer-column-title">Coastal Dispatch</h3>
            <div className="footer-newsletter-card space-y-3">
              <p className="text-xs text-gray-300 leading-normal">
                Get weekly satellite alerts on coastal canopy health and blue carbon reserves.
              </p>

              <form onSubmit={handleSubscribe} noValidate className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ranger@coastalguard.org"
                  className="footer-input"
                  required
                />
                <button
                  type="submit"
                  className="footer-submit-btn w-full"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe</span>
                </button>
              </form>

              <div className="text-[10px] text-gray-400 flex items-center gap-1 pt-1 border-t border-emerald-950/50">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Zero spam. Direct Sentinel-2 spectral alerts.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-950/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400">
            &copy; 2026 <span className="text-emerald-400 font-semibold">TidalTrees</span>. All rights reserved.
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/15">
            <span>Made for <strong className="text-white">HackOut 2026</strong> with</span>
            <span className="text-base" role="img" aria-label="ocean wave">🌊</span>
            <span>for Coastal Ecosystems</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
