import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Anchor, Settings, Sparkles } from 'lucide-react';
import useLineupStore from '../store/lineupStore';
import useAuthStore from '../store/authStore';
import useSettingsStore from '../store/settingsStore';
import { loadAthletes, loadBoats, loadShells, loadErgData } from '../utils/csvParser';
import { preloadHeadshots } from '../utils/fileLoader';
import LoginModal from '../components/Auth/LoginModal';
import RegisterModal from '../components/Auth/RegisterModal';
import AdminPanel from '../components/Auth/AdminPanel';
import LineupAssistant, { AIAssistantButton } from '../components/AI/LineupAssistant';
import { Sidebar } from '../components/compound/Sidebar';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMinimized, setAiMinimized] = useState(false);

  const {
    setAthletes,
    setBoatConfigs,
    setShells,
    setErgData,
    setHeadshotMap,
  } = useLineupStore();

  const { user, token, verify, logout } = useAuthStore();
  const { features } = useSettingsStore();
  const aiEnabled = features.aiAssistant;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    verify();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const athletesData = await loadAthletes('/api/data/athletes.csv');
        setAthletes(athletesData);

        const boatsData = await loadBoats('/data/boats.csv');
        setBoatConfigs(boatsData);

        const shellsData = await loadShells('/data/shells.csv');
        setShells(shellsData);

        const ergData = await loadErgData('/data/erg_data_template.csv');
        setErgData(ergData);

        const headshotMap = await preloadHeadshots(athletesData);
        setHeadshotMap(headshotMap);

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--accent)] flex items-center justify-center">
            <Anchor className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="card p-8 max-w-md text-center">
          <p className="text-[var(--error)] mb-4">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSettingsClick={() => {
          setSidebarOpen(false);
          setShowAdminPanel(true);
        }}
      />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 modal-backdrop z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="topbar-title">
              {location.pathname === '/app' && 'Dashboard'}
              {location.pathname === '/app/lineup' && 'Lineup Builder'}
              {location.pathname === '/app/athletes' && 'Athletes'}
              {location.pathname === '/app/erg' && 'Erg Data'}
              {location.pathname === '/app/analytics' && 'Analytics'}
              {location.pathname === '/app/settings' && 'Settings'}
            </span>
          </div>

          <div className="topbar-actions">
            {token && user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="btn-icon"
                    title="Admin Panel"
                  >
                    <Settings size={18} />
                  </button>
                )}
                {aiEnabled && (
                  <button
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="btn-icon"
                    title="AI Assistant"
                  >
                    <Sparkles size={18} />
                  </button>
                )}
                <span className="text-sm text-[var(--text-secondary)] hidden sm:block">
                  {user.name || user.username}
                </span>
                <button onClick={handleLogout} className="btn-icon" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn btn-primary"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />

      {/* AI Assistant */}
      <AnimatePresence>
        {showAIAssistant && (
          <LineupAssistant
            isOpen={showAIAssistant}
            onClose={() => setShowAIAssistant(false)}
            isMinimized={aiMinimized}
            onToggleMinimize={() => setAiMinimized(!aiMinimized)}
          />
        )}
      </AnimatePresence>

      {/* AI Floating Button (shows when assistant is closed and AI is enabled) */}
      {!showAIAssistant && aiEnabled && token && (
        <AIAssistantButton onClick={() => setShowAIAssistant(true)} />
      )}
    </div>
  );
}

export default AppLayout;
