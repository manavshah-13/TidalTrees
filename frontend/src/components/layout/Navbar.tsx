import React, { useState, useEffect, useRef } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Dynamic indicator measurement refs
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'ai-validation', label: 'AI Validation', icon: Sparkles },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  // 1. Scroll-Triggered Dynamic Header Styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Sliding Active Tab Indicator positioning
  const updateIndicator = () => {
    const currentTabEl = tabRefs.current[activeTab];
    if (currentTabEl) {
      setIndicatorStyle({
        left: currentTabEl.offsetLeft,
        width: currentTabEl.offsetWidth,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [activeTab]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  return (
    <header className={`navbar-root ${isScrolled ? 'navbar-scrolled' : ''}`}>
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

        {/* Navigation Tabs (Desktop) with Sliding Indicator */}
        <nav className="navbar-links nav-tabs-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabRefs.current[item.id] = el;
                }}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab-btn relative flex items-center gap-1.5 ${
                  isActive ? 'nav-tab-active text-emerald-400 font-bold' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>

                {/* 3. Feature Attention Indicator (Pulse Dot) on AI Validation */}
                {item.id === 'ai-validation' && (
                  <span className="relative flex h-2 w-2 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                  </span>
                )}
              </button>
            );
          })}

          {/* Sliding Active Tab Indicator Bar */}
          <div
            className="nav-active-indicator"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </nav>

        {/* Right CTA Actions */}
        <div className="navbar-actions flex items-center gap-2.5">
          {/* Quick Report CTA (Desktop & Tablet) */}
          <button
            onClick={onOpenReportModal}
            className="btn-report-cta hidden sm:flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
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
                className="logout-btn p-1.5 text-gray-400 hover:text-rose-400 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn-secondary flex items-center gap-1.5 py-2 px-3 text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-emerald-950/40 border border-emerald-500/20 cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-emerald-400" />
            ) : (
              <Menu className="w-5 h-5 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* 4. Smooth Mobile Drawer Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* 4. Smooth Mobile Drawer Slide-In Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-[#041014]/98 border-l border-emerald-500/25 shadow-2xl p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="brand-logo-glow !w-8 !h-8">
                <Trees className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight">TidalTrees</span>
                <span className="text-[10px] text-emerald-400 block font-mono">Coastal Sentinel</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-emerald-950/40 border border-emerald-500/20 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'ai-validation' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-gray-800 space-y-3">
          <button
            onClick={() => {
              onOpenReportModal();
              setIsMobileMenuOpen(false);
            }}
            className="w-full btn-report-cta flex items-center justify-center gap-2 py-2.5 text-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>

          {isAuthenticated && user ? (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="user-avatar-circle !w-7 !h-7 !text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">{user.username}</div>
                  <div className="text-[10px] text-emerald-400">{user.points || 0} pts</div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-gray-400 hover:text-rose-400 p-1 cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuthModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm cursor-pointer"
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
