import React from 'react';
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Brand */}
        <div
          className="navbar-brand cursor-pointer flex items-center gap-2.5"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="brand-logo-glow">
            <Trees className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="brand-title">TidalTrees</span>
            <span className="brand-subtitle block">Coastal Guardian Network</span>
          </div>
        </div>

        {/* Navigation Tabs */}
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
        <div className="navbar-actions">
          {/* Quick Report CTA */}
          <button
            onClick={onOpenReportModal}
            className="btn-report-cta flex items-center gap-1.5"
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
        </div>
      </div>
    </header>
  );
};
