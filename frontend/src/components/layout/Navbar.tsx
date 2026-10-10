import React, { useState } from 'react';
import {
  Trees,
  PlusCircle,
  Trophy,
  LayoutDashboard,
  Users,
  Mail,
  LogOut,
  LogIn,
  Award,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenAuthModal,
}) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'ai-validation', label: 'AI Validation', icon: Sparkles },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Brand */}
        <div
          className="navbar-brand cursor-pointer flex items-center gap-2.5"
          onClick={() => {
            setActiveTab('dashboard');
            setIsMobileMenuOpen(false);
          }}
        >
          <div className="brand-logo-glow">
            <Trees className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="brand-title">TidalTrees</span>
            <span className="brand-subtitle block">Coastal Guardian Network</span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="navbar-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab-btn ${isActive ? 'nav-tab-active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="navbar-actions flex items-center gap-2.5">
          {/* Quick Report CTA (Desktop & Tablet) */}
          <button
            onClick={onOpenReportModal}
            className="btn-report-cta hidden sm:flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>

          {/* Auth State */}
          {isAuthenticated && user ? (
            <div className="user-profile-badge">
              <div className="flex items-center gap-2">
                <div className="user-avatar-circle">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {user.username}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Award className="w-3 h-3 inline" />
                    <span>{user.points || 0} pts</span>
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="logout-btn p-1.5 text-gray-400 hover:text-rose-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn-secondary flex items-center gap-1.5 py-2 px-3 text-sm"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-emerald-950/40 border border-emerald-500/20"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-emerald-400" />
            ) : (
              <Menu className="w-5 h-5 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-500/20 bg-[#041014]/95 backdrop-blur-md px-4 py-3 space-y-1.5 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-gray-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenReportModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full btn-report-cta flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Incident</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
