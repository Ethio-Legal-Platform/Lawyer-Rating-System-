import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Components & Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import DirectoryPage from './pages/DirectoryPage';
import QAPage from './pages/QAPage';
import GuidesPage from './pages/GuidesPage';
import AboutPage from './pages/AboutPage';

// Feature Modals
import AuthModal from './features/auth/AuthModal';
import ProfileModal from './features/profile/ProfileModal';
import LawyerModal from './features/directory/LawyerModal';
import GuideModal from './features/guides/GuideModal';
import QuestionThreadModal from './features/qa/QuestionThreadModal';
import AskQuestionModal from './features/qa/AskQuestionModal';

// Services & Utils
import { api } from './services/api';
import { getStoredUser, storeUser, clearStoredUser, clearToken } from './utils/storage';

export default function App() {
  // State: Theme (Light Mode by default, remembered per account & device)
  const [theme, setTheme] = useState(() => {
    try {
      const currentUser = getStoredUser();
      if (currentUser?.themePreference) {
        return currentUser.themePreference;
      }
      const stored = localStorage.getItem('lex-theme');
      if (stored) return stored;
      return 'light';
    } catch {
      return 'light';
    }
  });

  // State: Navigation & Authentication
  const [user, setUser] = useState(getStoredUser);
  const [page, setPage] = useState('home');
  const [authConfig, setAuthConfig] = useState({ open: false, tab: 'login', role: 'client' });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // State: Directory & Lawyers
  const [lawyers, setLawyers] = useState([]);
  const [loadingLawyers, setLoadingLawyers] = useState(true);
  const [searchSpec, setSearchSpec] = useState('');
  const [searchCity, setSearchCity] = useState('');

  // State: Q&A Forum
  const [questions, setQuestions] = useState([]);
  const [privateInquiries, setPrivateInquiries] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [qaTab, setQaTab] = useState('public');
  const [qaCatFilter, setQaCatFilter] = useState('All');
  const [qaSearchTerm, setQaSearchTerm] = useState('');

  // State: Active Modals
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [consultLawyer, setConsultLawyer] = useState(null);

  // Theme Sync Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('lex-theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user?.id) {
      const updatedUser = { ...user, themePreference: nextTheme };
      setUser(updatedUser);
      storeUser(updatedUser);
      api.updateThemePreference(user.id, nextTheme).catch(() => {});
    }
  };

  // Data Fetching: Lawyers
  const fetchLawyers = useCallback(async (spec = searchSpec, city = searchCity) => {
    setLoadingLawyers(true);
    try {
      const data = await api.searchLawyers(spec, city);
      setLawyers(Array.isArray(data) ? data : []);
    } catch {
      setLawyers([]);
    } finally {
      setLoadingLawyers(false);
    }
  }, [searchSpec, searchCity]);

  // Data Fetching: Q&A Questions
  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const data = await api.getQuestions(qaCatFilter, qaSearchTerm);
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  }, [qaCatFilter, qaSearchTerm]);

  // Data Fetching: Private Inquiries
  const fetchPrivateInquiries = useCallback(async () => {
    if (!user) {
      setPrivateInquiries([]);
      return;
    }
    setLoadingInquiries(true);
    try {
      const data = await api.getInquiries(user);
      setPrivateInquiries(Array.isArray(data) ? data : []);
    } catch {
      setPrivateInquiries([]);
    } finally {
      setLoadingInquiries(false);
    }
  }, [user]);

  // Initial Effects
  useEffect(() => {
    fetchLawyers(searchSpec, searchCity);
  }, [fetchLawyers, searchSpec, searchCity]);

  useEffect(() => {
    if (page === 'qa' || page === 'home') {
      fetchQuestions();
    }
  }, [page, fetchQuestions]);

  useEffect(() => {
    if (user && (page === 'qa' || qaTab === 'private')) {
      fetchPrivateInquiries();
    }
  }, [user, page, qaTab, fetchPrivateInquiries]);

  // Auth Handlers
  const handleLogin = (nextUser) => {
    setUser(nextUser);
    storeUser(nextUser);
    if (nextUser?.themePreference && (nextUser.themePreference === 'light' || nextUser.themePreference === 'dark')) {
      setTheme(nextUser.themePreference);
    }
  };

  const handleLogout = () => {
    clearToken();
    clearStoredUser();
    setUser(null);
    setShowProfileModal(false);
    setPage('home');
  };

  const handleNavigate = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    storeUser(updatedUser);
    if (updatedUser?.themePreference) {
      setTheme(updatedUser.themePreference);
    }
    fetchLawyers();
  };

  // Search Handler
  const handleSearch = (spec, city) => {
    setSearchSpec(spec);
    setSearchCity(city);
    fetchLawyers(spec, city);
  };

  const handleConsultLawyer = (lawyer) => {
    setConsultLawyer(lawyer);
    setShowAskModal(true);
  };

  const handleConsultFromGuide = (guideCat) => {
    const spec = guideCat.replace(' Law', '').replace(' & Land', '');
    handleSearch(spec, '');
    setPage('directory');
  };

  const handleOpenAuth = (opts = {}) => {
    if (typeof opts === 'object' && opts !== null) {
      setAuthConfig({
        open: true,
        tab: opts.tab || 'login',
        role: opts.role || 'client',
      });
    } else {
      setAuthConfig({ open: true, tab: 'login', role: 'client' });
    }
  };

  return (
    <div className="avvo-root">
      {/* Navigation Header */}
      <Navbar
        user={user}
        page={page}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigate}
        onSignIn={handleOpenAuth}
        onSignOut={handleLogout}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Pages */}
      {page === 'home' && (
        <Home
          onSearch={handleSearch}
          onSelectGuide={setSelectedGuide}
          onNavigate={setPage}
        />
      )}

      {page === 'directory' && (
        <DirectoryPage
          lawyers={lawyers}
          loading={loadingLawyers}
          searchSpec={searchSpec}
          searchCity={searchCity}
          onSearch={handleSearch}
          onSelectLawyer={setSelectedLawyer}
        />
      )}

      {page === 'qa' && (
        <QAPage
          user={user}
          questions={questions}
          privateInquiries={privateInquiries}
          loadingQuestions={loadingQuestions}
          loadingInquiries={loadingInquiries}
          qaTab={qaTab}
          qaCatFilter={qaCatFilter}
          qaSearchTerm={qaSearchTerm}
          onSetQaTab={setQaTab}
          onSetQaCatFilter={setQaCatFilter}
          onSetQaSearchTerm={setQaSearchTerm}
          onSelectQuestion={setSelectedQuestionId}
          onOpenAskModal={() => setShowAskModal(true)}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {page === 'guides' && (
        <GuidesPage onSelectGuide={setSelectedGuide} />
      )}

      {page === 'about' && (
        <AboutPage
          onNavigate={setPage}
          onSearch={handleSearch}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={setPage}
        onSearchSpec={(spec) => handleSearch(spec, '')}
        onOpenAuth={handleOpenAuth}
      />

      {/* Active Modals */}
      {selectedLawyer && (
        <LawyerModal
          lawyer={selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
          onConsult={handleConsultLawyer}
        />
      )}

      {selectedGuide && (
        <GuideModal
          guide={selectedGuide}
          onClose={() => setSelectedGuide(null)}
          onConsultAdvocate={handleConsultFromGuide}
        />
      )}

      {selectedQuestionId && (
        <QuestionThreadModal
          questionId={selectedQuestionId}
          initialQuestion={
            questions.find(q => q.id === selectedQuestionId) ||
            privateInquiries.find(q => q.id === selectedQuestionId) ||
            null
          }
          currentUser={user}
          onClose={() => setSelectedQuestionId(null)}
          onRefreshList={() => {
            fetchQuestions();
            if (user) fetchPrivateInquiries();
          }}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {showAskModal && (
        <AskQuestionModal
          currentUser={user}
          initialLawyer={consultLawyer}
          onClose={() => {
            setShowAskModal(false);
            setConsultLawyer(null);
          }}
          onQuestionCreated={() => {
            fetchQuestions();
            if (user) fetchPrivateInquiries();
          }}
        />
      )}

      {/* Profile Management Modal */}
      {showProfileModal && user && (
        <ProfileModal
          currentUser={user}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Authentication Modal */}
      {authConfig.open && (
        <AuthModal
          initialTab={authConfig.tab}
          initialRole={authConfig.role}
          onClose={() => setAuthConfig({ open: false, tab: 'login', role: 'client' })}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
