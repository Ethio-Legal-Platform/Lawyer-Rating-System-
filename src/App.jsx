import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

// ─── Star Rating Component ───────────────────────────────────────────────────
function StarRow({ rating, max = 5 }) {
  const filled = Math.round(rating);
  return (
    <span className="lawyer-card-stars" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star${i < filled ? '' : ' empty'}`}>★</span>
      ))}
    </span>
  );
}

// ─── Lawyer Card ─────────────────────────────────────────────────────────────
function LawyerCard({ lawyer }) {
  return (
    <article className="lawyer-card animate-fade-up">
      <img
        src={lawyer.profilePic}
        alt={lawyer.name}
        className="lawyer-card-avatar"
        onError={e => {
          e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';
        }}
      />
      <div className="lawyer-card-body">
        <h3 className="lawyer-card-name">{lawyer.name}</h3>
        <span className="lawyer-card-spec">{lawyer.specialization}</span>
        <div className="lawyer-card-stats">
          <StarRow rating={lawyer.rating} />
          <span className="lawyer-card-rating">{lawyer.rating.toFixed(1)}</span>
          <span className="lawyer-card-cases">
            {lawyer.casesCount} {lawyer.casesCount === 1 ? 'case' : 'cases'}
          </span>
          <span className="lawyer-card-elo">{lawyer.elo} ELO</span>
        </div>
      </div>
    </article>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onLogin }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '', username: '', password: '', email: '',
    role: 'client', licenseNumber: '', specialization: 'Criminal',
  });
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ── Login ──
  const handleLogin = async e => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Welcome back, ${data.user.name}!`);
        setTimeout(() => { onLogin(data.user); onClose(); }, 800);
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Cannot reach the server. Is it running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  // ── Register ──
  const handleRegister = async e => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpEmail(regForm.email);
        setStep('otp');
        setSuccess('A 6-digit verification code has been sent to your email.');
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Cannot reach the server. Is it running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP verify ──
  const handleVerify = async e => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, code: otpCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Account verified! Please sign in.');
        setTimeout(() => { setTab('login'); setStep('form'); clearMessages(); }, 1200);
      } else {
        setError(data.error || 'Invalid or expired code.');
      }
    } catch {
      setError('Cannot reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal animate-fade-up"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="modal-title">
              {step === 'otp'
                ? 'Verify your email'
                : tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="modal-subtitle">
              {step === 'otp'
                ? `Code sent to ${otpEmail}`
                : tab === 'login'
                  ? 'Sign in to your LEX-RATING account'
                  : 'Register with your verified credentials'}
            </p>
          </div>
          <button
            className="modal-close focus-ring"
            onClick={onClose}
            aria-label="Close dialog"
          >✕</button>
        </div>

        <div className="modal-body">
          {/* Tabs — only show when not in OTP step */}
          {step === 'form' && (
            <div className="modal-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={tab === 'login'}
                className={`modal-tab${tab === 'login' ? ' active' : ''}`}
                onClick={() => { setTab('login'); clearMessages(); }}
                id="tab-login"
              >Sign In</button>
              <button
                role="tab"
                aria-selected={tab === 'register'}
                className={`modal-tab${tab === 'register' ? ' active' : ''}`}
                onClick={() => { setTab('register'); clearMessages(); }}
                id="tab-register"
              >Register</button>
            </div>
          )}

          {/* Error / Success banners */}
          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠</span><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="status">
              <span>✓</span><span>{success}</span>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerify} noValidate>
              <div className="form-group">
                <label htmlFor="otp-code" className="form-label">6-Digit Verification Code</label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="form-input otp-input focus-ring"
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
                <p className="form-helper">Check your inbox (and spam folder). The code expires in 10 minutes.</p>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading || otpCode.length !== 6}
              >
                {loading ? <span className="loading-spinner" /> : 'Verify & Complete Registration'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-full"
                style={{ marginTop: '0.5rem' }}
                onClick={() => { setStep('form'); setOtpCode(''); clearMessages(); }}
              >← Back</button>
            </form>
          )}

          {/* Login Form */}
          {step === 'form' && tab === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label htmlFor="login-username" className="form-label">Username or Email</label>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  className="form-input focus-ring"
                  placeholder="Enter your username or email"
                  value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Password</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  className="form-input focus-ring"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? <span className="loading-spinner" /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {step === 'form' && tab === 'register' && (
            <form onSubmit={handleRegister} noValidate>
              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  className="form-input focus-ring"
                  placeholder="e.g. John Smith"
                  value={regForm.name}
                  onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-email" className="form-label">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  className="form-input focus-ring"
                  placeholder="yourname@example.com"
                  value={regForm.email}
                  onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-username" className="form-label">Username</label>
                <input
                  id="reg-username"
                  type="text"
                  autoComplete="username"
                  className="form-input focus-ring"
                  placeholder="Choose a username"
                  value={regForm.username}
                  onChange={e => setRegForm({ ...regForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  className="form-input focus-ring"
                  placeholder="Create a secure password"
                  value={regForm.password}
                  onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-role" className="form-label">Account Type</label>
                <select
                  id="reg-role"
                  className="form-select focus-ring"
                  value={regForm.role}
                  onChange={e => setRegForm({ ...regForm, role: e.target.value })}
                >
                  <option value="client">Client (Litigant)</option>
                  <option value="lawyer">Advocate (Lawyer)</option>
                </select>
              </div>

              {regForm.role === 'lawyer' && (
                <div className="license-box">
                  <div className="license-box-title">
                    <span>🔒</span> MoJ License Verification Required
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-license" className="form-label">License Number</label>
                    <input
                      id="reg-license"
                      type="text"
                      className="form-input focus-ring"
                      placeholder="e.g. LAW-1001"
                      value={regForm.licenseNumber}
                      onChange={e => setRegForm({ ...regForm, licenseNumber: e.target.value })}
                      required
                    />
                    <p className="form-helper">
                      Your full name must exactly match the name on the MoJ registry.
                    </p>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="reg-spec" className="form-label">Case Specialization</label>
                    <select
                      id="reg-spec"
                      className="form-select focus-ring"
                      value={regForm.specialization}
                      onChange={e => setRegForm({ ...regForm, specialization: e.target.value })}
                    >
                      <option value="Criminal">Criminal</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Family">Family</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: '0.75rem' }}
                disabled={loading}
              >
                {loading ? <span className="loading-spinner" /> : 'Create Account & Send OTP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'about'

  // Search & directory
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpec, setActiveSpec] = useState('');
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);

  const SPECS = ['Criminal', 'Corporate', 'Family', 'Civil'];

  const fetchLawyers = useCallback(async (spec = '') => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/lawyers/search?specialization=${encodeURIComponent(spec)}`
      );
      const data = await res.json();
      if (Array.isArray(data)) setLawyers(data);
    } catch {
      // server offline — show empty gracefully
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all lawyers on mount
  useEffect(() => { fetchLawyers(''); }, [fetchLawyers]);

  const handleSearch = e => {
    const val = e.target.value;
    setSearchQuery(val);
    setActiveSpec('');
    fetchLawyers(val);
  };

  const handleSpecChip = spec => {
    if (activeSpec === spec) {
      setActiveSpec('');
      setSearchQuery('');
      fetchLawyers('');
    } else {
      setActiveSpec(spec);
      setSearchQuery('');
      fetchLawyers(spec);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveTab('home');
  };

  return (
    <div className="app-wrapper">
      {/* ── NAVBAR ── */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          {/* Logo */}
          <button
            className="navbar-logo focus-ring"
            onClick={() => setActiveTab('home')}
            aria-label="LEX-RATING home"
            style={{ border: 'none', background: 'none' }}
          >
            <div className="navbar-logo-icon" aria-hidden="true">⚖</div>
            <div className="navbar-logo-text">
              <span className="navbar-logo-title">LEX-RATING</span>
              <span className="navbar-logo-subtitle">B2G Legal Directory</span>
            </div>
          </button>

          {/* Nav links */}
          <div className="navbar-nav" role="menubar">
            <button
              role="menuitem"
              className={`navbar-nav-link focus-ring${activeTab === 'home' ? ' active' : ''}`}
              onClick={() => setActiveTab('home')}
            >Directory</button>
            <button
              role="menuitem"
              className={`navbar-nav-link focus-ring${activeTab === 'about' ? ' active' : ''}`}
              onClick={() => setActiveTab('about')}
            >About</button>
          </div>

          {/* Auth area */}
          <div className="navbar-actions">
            {user ? (
              <>
                <div className="navbar-user">
                  <img
                    src={user.profilePic || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'}
                    alt={user.name}
                    className="navbar-user-avatar"
                    onError={e => {
                      e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                  <div className="navbar-user-info">
                    <span className="navbar-user-name">{user.name}</span>
                    <span className="navbar-user-role">{user.role}</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm focus-ring" onClick={logout}>
                  Sign Out
                </button>
              </>
            ) : (
              <button
                id="btn-signin"
                className="btn btn-primary btn-sm focus-ring"
                onClick={() => setShowAuth(true)}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── AUTH MODAL ── */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={u => setUser(u)}
        />
      )}

      {/* ════════════════════════════════════════
          HOME PAGE
          ════════════════════════════════════════ */}
      {activeTab === 'home' && (
        <>
          {/* Hero */}
          <section className="hero texture-grain" aria-labelledby="hero-heading">
            <div className="hero-glow-1" aria-hidden="true" />
            <div className="hero-glow-2" aria-hidden="true" />
            <div className="hero-inner">
              <div className="hero-badge" aria-label="Status: Live">
                <span className="hero-badge-dot" aria-hidden="true" />
                Official Ministry of Justice Registry
              </div>
              <h1 className="hero-title" id="hero-heading">
                Find a <span className="hero-title-accent">verified</span><br />
                legal advocate
              </h1>
              <p className="hero-subtitle">
                Search registered lawyers by specialization, compare real-time
                ELO performance ratings, and connect with the right advocate for your case.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-gold btn-lg focus-ring"
                  onClick={() => {
                    document.getElementById('lawyer-directory')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Browse Advocates
                </button>
                {!user && (
                  <button
                    className="btn btn-ghost btn-lg focus-ring"
                    style={{ color: 'rgba(245,239,226,0.8)', border: '1px solid rgba(245,239,226,0.2)' }}
                    onClick={() => setShowAuth(true)}
                  >
                    Register Account
                  </button>
                )}
              </div>

              {/* Hero stats */}
              <div className="hero-stats" role="list" aria-label="Platform statistics">
                <div className="hero-stat" role="listitem">
                  <div className="hero-stat-value">{lawyers.length}+</div>
                  <div className="hero-stat-label">Verified Advocates</div>
                </div>
                <div className="hero-stat" role="listitem">
                  <div className="hero-stat-value">{SPECS.length}</div>
                  <div className="hero-stat-label">Specializations</div>
                </div>
                <div className="hero-stat" role="listitem">
                  <div className="hero-stat-value">ELO</div>
                  <div className="hero-stat-label">Live Ratings</div>
                </div>
              </div>
            </div>
          </section>

          {/* Directory */}
          <main className="main-content" id="lawyer-directory">
            {/* Search */}
            <section className="search-section" aria-label="Search lawyers">
              <div className="search-header">
                <h2 className="search-title">Search Legal Advocates</h2>
                <p className="search-subtitle">
                  Filter by specialization or search by name to find verified professionals.
                </p>
              </div>

              <div className="search-bar" role="search">
                <span className="search-bar-icon" aria-hidden="true">🔍</span>
                <input
                  id="search-advocates"
                  type="search"
                  className="search-input focus-ring"
                  placeholder="Search by specialization (Criminal, Corporate, Family, Civil)…"
                  value={searchQuery}
                  onChange={handleSearch}
                  aria-label="Search legal advocates by specialization"
                />
              </div>

              <div className="spec-filters" role="group" aria-label="Filter by specialization">
                {SPECS.map(spec => (
                  <button
                    key={spec}
                    className={`spec-chip focus-ring${activeSpec === spec ? ' active' : ''}`}
                    onClick={() => handleSpecChip(spec)}
                    aria-pressed={activeSpec === spec}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </section>

            {/* Results */}
            <section className="lawyers-section" aria-label="Lawyer directory results">
              <div className="lawyers-header">
                <h2 className="lawyers-count">
                  <span>{lawyers.length}</span>{' '}
                  {lawyers.length === 1 ? 'Advocate' : 'Advocates'} Found
                </h2>
                {(searchQuery || activeSpec) && (
                  <button
                    className="btn btn-ghost btn-sm focus-ring"
                    onClick={() => { setSearchQuery(''); setActiveSpec(''); fetchLawyers(''); }}
                  >
                    Clear filter ✕
                  </button>
                )}
              </div>

              {loading ? (
                <div className="loading-overlay" role="status" aria-live="polite">
                  <span className="loading-spinner" />
                  <span>Loading advocates…</span>
                </div>
              ) : lawyers.length > 0 ? (
                <div
                  className="lawyers-grid"
                  role="list"
                  aria-label={`${lawyers.length} legal advocates`}
                >
                  {lawyers.map(lawyer => (
                    <div key={lawyer.id} role="listitem">
                      <LawyerCard lawyer={lawyer} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" role="status">
                  <div className="empty-state-icon" aria-hidden="true">⚖</div>
                  <p className="empty-state-text">No verified advocates found</p>
                  <p className="empty-state-sub">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different specialization.`
                      : 'No lawyers are registered yet. Be the first to register!'}
                  </p>
                  {!user && (
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: '1.5rem' }}
                      onClick={() => setShowAuth(true)}
                    >
                      Register as an Advocate
                    </button>
                  )}
                </div>
              )}
            </section>
          </main>
        </>
      )}

      {/* ════════════════════════════════════════
          ABOUT PAGE
          ════════════════════════════════════════ */}
      {activeTab === 'about' && (
        <main>
          <section className="about-section texture-grain" aria-labelledby="about-heading">
            <div className="about-inner">
              {/* Left column */}
              <div>
                <div className="about-eyebrow">
                  <span>⚖</span> Official B2G Portal
                </div>
                <h2 className="about-title" id="about-heading">
                  Transparent, data-driven<br />legal advocacy
                </h2>
                <p className="about-text">
                  LEX-RATING is the official government-to-business legal directory,
                  connecting litigants with Ministry of Justice verified legal advocates
                  through real-time ELO performance ratings.
                </p>
                <p className="about-text">
                  Every lawyer listed holds a verified MoJ license, ensuring
                  accountability and professionalism in every case engagement.
                </p>

                <div className="about-features" role="list">
                  {[
                    { icon: '🔒', text: 'Ministry of Justice license verification on registration' },
                    { icon: '📊', text: 'Real-time ELO rating engine — updated after every case' },
                    { icon: '⭐', text: 'Dual rating system: judge + client performance scores' },
                    { icon: '📧', text: 'Email-verified accounts via OTP authentication' },
                  ].map((f, i) => (
                    <div key={i} className="about-feature" role="listitem">
                      <div className="about-feature-icon" aria-hidden="true">{f.icon}</div>
                      <span className="about-feature-text">{f.text}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-gold btn-lg focus-ring"
                    onClick={() => setActiveTab('home')}
                  >Browse Directory</button>
                  {!user && (
                    <button
                      className="btn btn-ghost btn-lg focus-ring"
                      style={{ color: 'rgba(245,239,226,0.8)', border: '1px solid rgba(245,239,226,0.2)' }}
                      onClick={() => setShowAuth(true)}
                    >Create Account</button>
                  )}
                </div>
              </div>

              {/* Right column — MoJ registry preview */}
              <div>
                <div className="about-card">
                  <h3 className="about-card-title">
                    MoJ Verified Registry
                    <span className="verified-badge">✓ Live</span>
                  </h3>
                  <MojPreview />
                </div>

                {/* API info */}
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  background: 'rgba(245,239,226,0.04)',
                  border: '1px solid rgba(245,239,226,0.1)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(245,239,226,0.5)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                    API Endpoints
                  </p>
                  {[
                    'GET  /api/lawyers/search',
                    'POST /api/auth/register',
                    'POST /api/auth/login',
                    'GET  /api/court/lawyer-rating/:id',
                    'POST /api/moj/verify-license',
                  ].map(ep => (
                    <div key={ep} style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'rgba(245,239,226,0.6)',
                      padding: '0.25rem 0',
                      borderBottom: '1px solid rgba(245,239,226,0.06)',
                    }}>{ep}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ── FOOTER ── */}
      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-icon" aria-hidden="true">⚖</div>
            <span className="footer-brand-name">LEX-RATING</span>
          </div>
          <nav className="footer-links" aria-label="Footer links">
            <span className="footer-link" onClick={() => setActiveTab('about')}>About</span>
            <span className="footer-link">Privacy Directive</span>
            <span className="footer-link">Federal Registry</span>
            <span className="footer-link">Support</span>
          </nav>
          <span className="footer-copy">
            © 2026 Ministry of Justice & Court Automation Dept.
          </span>
        </div>
      </footer>
    </div>
  );
}

// ─── MoJ Registry Preview (fetches live from API) ────────────────────────────
function MojPreview() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/moj/licenses`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setLicenses(data.slice(0, 5));
      })
      .catch(() => setLicenses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(245,239,226,0.4)', fontSize: '0.875rem' }}>
        Loading registry…
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(245,239,226,0.4)', fontSize: '0.875rem' }}>
        Registry unavailable — start the server on port 5000.
      </div>
    );
  }

  return (
    <div className="moj-list" role="list" aria-label="MoJ verified license registry">
      {licenses.map(lic => (
        <div key={lic.licenseNumber} className="moj-item" role="listitem">
          <span className="moj-item-badge">{lic.licenseNumber}</span>
          <span className="moj-item-name">{lic.fullName}</span>
          <span className="moj-item-spec">{lic.specialization}</span>
        </div>
      ))}
    </div>
  );
}
