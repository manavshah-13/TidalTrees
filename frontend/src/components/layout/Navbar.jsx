import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/community', label: 'Community' },
  { path: '/reporting', label: 'Reporting' },
  { path: '/ai-validation', label: 'AI Validation' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <header className="fixed top-0 left-0 w-full bg-[#0a192f]/95 backdrop-blur-md z-50 border-b border-teal-500/20 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-teal-400 transition-colors">
          <span className="text-teal-400 text-2xl">🌿</span>
          TidalTrees
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-sm font-medium transition-colors relative pb-1 ${
                  location.pathname === link.path
                    ? 'text-teal-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-teal-400'
                    : 'text-slate-300 hover:text-teal-400'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-slate-400">{user.username}</span>
          <button
            onClick={logout}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white text-xl cursor-pointer"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#112240] border-t border-teal-500/20 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-slate-300 hover:text-teal-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => { logout(); setIsOpen(false); }}
            className="block py-2 text-red-400 hover:text-red-300 w-full text-left mt-2 border-t border-slate-700 pt-4 cursor-pointer"
          >
            Logout ({user.username})
          </button>
        </div>
      )}
    </header>
  );
}
