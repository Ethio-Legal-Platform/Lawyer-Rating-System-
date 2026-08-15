import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  // Authentication & Users
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'client',
    licenseNumber: '',
    specialization: 'Criminal'
  });
  const [verifyEmail, setVerifyEmail] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [realEmailLink, setRealEmailLink] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpUser, setOtpUser] = useState('');

  // Core Data
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('home'); // home

  // Load Initial Lawyers on Mount
  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearch = async (val) => {
    try {
      const res = await fetch(`${API_BASE}/lawyers/search?specialization=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data);
      }
    } catch (e) {
      console.error('Failed to search lawyers:', e);
    }
  };



  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (isLogin) {
      // Login flow (Direct access on correct password)
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authForm.username,
            password: authForm.password
          })
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setAuthSuccess(`Welcome back, ${data.user.name}!`);
          setTimeout(() => {
            setShowAuthModal(false);
            setAuthSuccess('');
          }, 1000);
        } else {
          setAuthError(data.error || 'Login failed');
        }
      } catch (err) {
        setAuthError('Server connection error');
      }
    } else {
      // Register flow (Sends OTP via Brevo API)
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authForm)
        });
        const data = await res.json();
        if (res.ok) {
          setOtpRequired(true);
          setVerifyEmail(authForm.email);
          setAuthSuccess('Verification code sent to your email!');
        } else {
          setAuthError(data.error || 'Registration failed');
        }
      } catch (err) {
        setAuthError('Server connection error');
      }
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/register-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifyEmail,
          code: verifyCode
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess('Email verified and account registered! Please sign in.');
        setOtpRequired(false);
        setVerifyEmail(null);
        setVerifyCode('');
        setIsLogin(true);
      } else {
        setAuthError(data.error || 'Verification failed');
      }
    } catch (err) {
      setAuthError('Server connection error');
    }
  };

  const logout = () => {
    setUser(null);
    setActiveTab('home');
  };

  return (
    <div className="container app-wrapper">
      {/* HEADER */}
      <header className="main-header glass-panel">
        <div className="header-logo" onClick={() => setActiveTab('home')} style={{cursor: 'pointer'}}>
          <div className="logo-icon">⚖️</div>
          <div>
            <h1>LEX-RATING</h1>
            <p className="subtitle">Official B2G Legal Directory</p>
          </div>
        </div>

        <nav className="header-nav">
          <a href="#" className={activeTab === 'home' ? 'active-link' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}>Home</a>
        </nav>

        <div className="auth-action">
          {user ? (
            <div className="user-profile-header">
              <img src={user.profilePic} alt={user.name} className="nav-profile-pic" />
              <div className="user-text">
                <span className="user-name">{user.name}</span>
                <span className="user-role-badge">{user.role}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => { setIsLogin(true); setShowAuthModal(true); }}>
              🔑 Sign In / Sign Up
            </button>
          )}
        </div>
      </header>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => { if (!otpRequired) setShowAuthModal(false); }}>
          <div className="glass-panel modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAuthModal(false)}>×</button>

            {otpRequired ? (
              <form onSubmit={handleVerifySubmit} className="auth-form-body">
                <h2>🔐 Verify Registration OTP</h2>
                <p>We've dispatched a real email verification code to your address: <strong>{verifyEmail}</strong>. Please enter it below.</p>
                
                <div className="form-group">
                  <label>6-Digit Code</label>
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    required
                  />
                </div>

                {realEmailLink && (
                  <div className="real-email-box">
                    <p>📬 <strong>SMTP Ethereal Sandbox Inbox:</strong></p>
                    <a href={realEmailLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm w-full">
                      Open Ethereal Test Mailbox ↗
                    </a>
                    <span className="helper-text" style={{marginTop: '0.25rem', display: 'block'}}>Since Ethereal dynamically captures sandbox mail, click to extract your real code.</span>
                  </div>
                )}

                {authError && <div className="error-banner">{authError}</div>}
                <button type="submit" className="btn btn-primary w-full">Verify & Sign In</button>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="auth-form-body">
                <h2>{isLogin ? '🔑 Portal Access' : '📝 Create Secure Account'}</h2>
                
                {!isLogin && (
                  <>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="yourname@example.com"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Account Role</label>
                      <select
                        value={authForm.role}
                        onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                      >
                        <option value="client">Client (Litigant)</option>
                        <option value="lawyer">Advocate (Lawyer)</option>
                      </select>
                    </div>

                    {authForm.role === 'lawyer' && (
                      <div className="border-gold border-padding">
                        <div className="form-group">
                          <label>License Number</label>
                          <input
                            type="text"
                            placeholder="e.g. LAW-1001"
                            value={authForm.licenseNumber}
                            onChange={(e) => setAuthForm({ ...authForm, licenseNumber: e.target.value })}
                            required
                          />
                          <span className="helper-text">Registration Name must align exactly with the associated name in registry.</span>
                        </div>
                        <div className="form-group" style={{marginTop: '0.75rem'}}>
                          <label>Case Specialization</label>
                          <select
                            value={authForm.specialization}
                            onChange={(e) => setAuthForm({ ...authForm, specialization: e.target.value })}
                          >
                            <option value="Criminal">Criminal</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Family">Family</option>
                            <option value="Civil">Civil</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </div>

                {authError && <div className="error-banner">{authError}</div>}
                {authSuccess && <div className="success-banner">{authSuccess}</div>}

                <button type="submit" className="btn btn-primary w-full" style={{marginTop: '1rem'}}>
                  {isLogin ? 'Sign In' : 'Register Account'}
                </button>

                <div className="auth-toggle">
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setAuthError(''); setAuthSuccess(''); }}>
                    {isLogin ? 'Need an account? Sign Up' : 'Already registered? Sign In'}
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="grid">
        
        {/* TAB 1: HOME PAGE */}
        {activeTab === 'home' && (
          <>
            {/* ABOUT US CARD */}
            <div className="col-12 glass-panel about-panel-card text-center fade-in-panel">
              <h2 className="section-title">About Our System</h2>
              <p className="lead-text">
                We connect lawyers and clients and provide ratings for lawyers. 
                Our platform filters and ranks registered legal advocates using verified case statistics, 
                guaranteeing clarity and efficiency in lawyer matching.
              </p>
            </div>

            {/* SEARCH BOX */}
            <div className="col-12 glass-panel search-panel text-center fade-in-panel">
              <h3>Search Legal Advocates</h3>
              <p className="helper-text">Enter your case type or specialization (e.g. Criminal, Corporate, Family, Civil) to find top rated professionals.</p>
              
              <div className="search-bar-wrapper">
                <input
                  type="text"
                  placeholder="🔍 Search specializations..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="search-input"
                />
              </div>
            </div>

            {/* LAWYER DIRECTORY RESULTS */}
            <div className="col-12 fade-in-panel">
              <h3 className="section-subtitle">Matching Legal Advocates ({searchResults.length})</h3>
              
              <div className="lawyer-results-grid">
                {searchResults.map((lawyer) => (
                  <div key={lawyer.id} className="lawyer-profile-card glass-panel">
                    <img 
                      src={lawyer.profilePic} 
                      alt={lawyer.name} 
                      className="profile-card-img" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'; }}
                    />
                    <div className="profile-card-details">
                      <h4>{lawyer.name}</h4>
                      <span className="specialization-tag">{lawyer.specialization}</span>
                      
                      <div className="rating-row">
                        <span className="stars-val">{'★'.repeat(Math.round(lawyer.rating))}</span>
                        <span className="rating-num">({lawyer.rating.toFixed(1)})</span>
                        {lawyer.elo !== undefined && (
                          <span className="elo-badge" style={{marginLeft: 'auto'}}>{lawyer.elo} ELO</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {searchResults.length === 0 && (
                  <div className="empty-state w-full col-12">
                    No verified advocates currently registered under "{searchQuery}".
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </main>

      {/* FOOTER */}
      <footer className="main-footer glass-panel">
        <div className="footer-links">
          <span>LEX-RATING B2G portal</span>
          <a href="#">Privacy Directive</a>
          <a href="#">Federal Registry</a>
          <a href="#">Support</a>
        </div>
        <div className="footer-copyright">
          © 2026 Ministry of Justice & Court Automation Department. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
