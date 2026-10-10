import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Community } from './pages/Community';
import { Leaderboard } from './pages/Leaderboard';
import { Contact } from './pages/Contact';
import { AiValidation } from './pages/AiValidation';
import { MultiStepReportModal } from './components/reports/MultiStepReportModal';
import { AuthModal } from './components/auth/AuthModal';
import { useAuthStore } from './store/useAuthStore';
import { Trees, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <div className="app-layout">
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#06201a',
            color: '#ecfdf5',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            fontSize: '13px',
            borderRadius: '10px',
            backdropFilter: 'blur(8px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#06201a',
            },
          },
          error: {
            style: {
              background: '#2b090b',
              color: '#ffe4e6',
              border: '1px solid rgba(244, 63, 94, 0.3)',
            },
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#2b090b',
            },
          },
        }}
      />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
        {activeTab === 'community' && <Community />}
        {activeTab === 'ai-validation' && (
          <AiValidation onOpenReportModal={() => setIsReportModalOpen(true)} />
        )}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'contact' && <Contact />}
      </main>

      {/* Modals */}
      <MultiStepReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Footer */}
      <footer className="footer-root">
        <div className="footer-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-sm">TidalTrees</span>
              <span className="text-gray-500 text-xs">| Participatory Mangrove Surveillance System</span>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span>Built for Coastal Conservation & Hackathon Excellence</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 inline" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
