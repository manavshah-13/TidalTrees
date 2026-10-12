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
import { Footer } from './components/layout/Footer';

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
            onNavigateTab={(tab) => setActiveTab(tab)}
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
      <Footer
        onNavigateTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />
    </div>
  );
};

export default App;
