import React, { useState } from 'react';
import ModalBackdrop from '../../components/common/ModalBackdrop';
import { api } from '../../services/api';
import { storeToken } from '../../utils/storage';
import { ETHIOPIAN_CITIES, SPECIALIZATION_LIST } from '../../data/constants';

export default function AuthModal({ onClose, onLogin, initialTab = 'login', initialRole = 'client' }) {
  const [tab, setTab]             = useState(initialTab);
  const [step, setStep]           = useState('form'); // 'form' | 'otp'
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm]     = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    role: initialRole,
    licenseNumber: '',
    specialization: 'Criminal Law',
    city: 'Addis Ababa',
    phone: '',
    bio: '',
    yearsExperience: '',
    education: '',
    languages: 'Amharic, English',
  });

  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode]   = useState('');

  const clear = () => { setError(''); setSuccess(''); };
  const f = (k, v) => setRegForm(p => ({ ...p, [k]: v }));

  // Quick fill for testing
  const quickFill = (userType) => {
    clear();
    if (userType === 'advocate') {
      setLoginForm({ username: 'kebede', password: 'password123' });
    } else {
      setLoginForm({ username: 'dawit', password: 'password123' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clear();
    if (!loginForm.username.trim() || !loginForm.password) {
      setError('Please enter your username/email and password.');
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await api.login(loginForm);
      if (ok) {
        setSuccess(`Welcome back, ${data.user.name}!`);
        if (data.token) storeToken(data.token);
        setTimeout(() => {
          onLogin(data.user, data.token);
          onClose();
        }, 600);
      } else {
        setError(data.error || 'Login failed. Please verify your credentials.');
      }
    } catch {
      setError('Cannot connect to backend server on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clear();

    if (!regForm.name.trim() || !regForm.email.trim() || !regForm.username.trim() || !regForm.password) {
      setError('Please fill in all required fields (Name, Email, Username, Password).');
      return;
    }

    if (regForm.role === 'lawyer' && !regForm.licenseNumber.trim()) {
      setError('Advocate registration requires a valid MoJ License Number (e.g. LAW-1001).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...regForm,
        languages: regForm.languages ? regForm.languages.split(',').map(l => l.trim()).filter(Boolean) : []
      };
      const { ok, data } = await api.register(payload);
      if (ok) {
        setOtpEmail(regForm.email);
        setStep('otp');
        setSuccess('Verification code sent to your email address.');
      } else {
        setError(data.error || 'Registration failed. Check your information.');
      }
    } catch {
      setError('Cannot connect to backend server on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    clear();
    setResending(true);
    try {
      const { ok, data } = await api.resendOtp(otpEmail);
      if (ok) {
        setSuccess('A new verification code has been dispatched to your email.');
      } else {
        setError(data.error || 'Failed to resend verification code.');
      }
    } catch {
      setError('Cannot connect to backend server.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    clear();
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await api.verifyRegistration({ email: otpEmail, code: otpCode });
      if (ok) {
        setSuccess('Email verified successfully! You can now sign in.');
        setTimeout(() => {
          setTab('login');
          setStep('form');
          setLoginForm({ username: regForm.username, password: regForm.password });
          clear();
        }, 1000);
      } else {
        setError(data.error || 'Invalid or expired verification code.');
      }
    } catch {
      setError('Cannot reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBackdrop className="auth-backdrop" style={{ zIndex: 2000 }} onClose={onClose}>
      <div 
        className={`auth-modal-dialog ${tab === 'register' ? 'auth-modal-wide' : ''}`}
        role="dialog" 
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="auth-header">
          <div className="auth-header-icon-box">
            <span className="auth-header-icon">⚖️</span>
          </div>
          <div className="auth-header-text">
            <h2 className="auth-title">
              {step === 'otp'
                ? 'Verify Your Email'
                : tab === 'login'
                  ? 'Sign in to LEX-RATING'
                  : 'Create Your Account'}
            </h2>
            <p className="auth-sub">
              {step === 'otp'
                ? `Enter the 6-digit code sent to ${otpEmail}`
                : tab === 'login'
                  ? 'Access certified lawyer directories, ask legal questions, and manage consultations'
                  : 'Join Ethiopia\'s verified legal network as an advocate or client'}
            </p>
          </div>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        {step === 'form' && (
          <div className="auth-tab-bar">
            <button 
              type="button"
              className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`} 
              onClick={() => { setTab('login'); clear(); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`} 
              onClick={() => { setTab('register'); clear(); }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="auth-content">
          {error && (
            <div className="auth-alert error">
              <span className="auth-alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="auth-alert success">
              <span className="auth-alert-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* ─── OTP Verification Step ─── */}
          {step === 'otp' && (
            <form onSubmit={handleVerify} className="auth-form" noValidate>
              <div className="auth-otp-box">
                <label className="auth-label">6-Digit Verification Code</label>
                <input
                  className="auth-input otp-code-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
                <p className="auth-hint">Check your email inbox or spam folder. The code expires in 10 minutes.</p>
              </div>

              <button 
                type="submit" 
                className="btn btn-gold btn-full auth-submit-btn" 
                disabled={loading || otpCode.length !== 6}
              >
                {loading ? 'Verifying…' : 'Verify & Activate Account'}
              </button>

              <div className="auth-otp-actions">
                <button 
                  type="button" 
                  className="btn btn-dark-outline" 
                  style={{ flex: 1 }} 
                  onClick={handleResendOtp} 
                  disabled={resending}
                >
                  {resending ? 'Sending…' : 'Resend Code'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-dark-outline" 
                  style={{ flex: 1 }} 
                  onClick={() => { setStep('form'); setOtpCode(''); clear(); }}
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* ─── Sign In Form ─── */}
          {step === 'form' && tab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form" noValidate>
              <div className="auth-field">
                <label className="auth-label">Username or Email</label>
                <input
                  className="auth-input"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username or email"
                  value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  className="auth-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-gold btn-full auth-submit-btn" 
                disabled={loading}
              >
                {loading ? 'Signing In…' : 'Sign In to Account'}
              </button>

              {/* Quick Demo Sign In Helper */}
              <div className="auth-demo-helper">
                <span className="auth-demo-title">Quick Demo Logins:</span>
                <div className="auth-demo-chips">
                  <button 
                    type="button" 
                    className="auth-demo-chip"
                    onClick={() => quickFill('advocate')}
                  >
                    Advocate: <strong>kebede</strong>
                  </button>
                  <button 
                    type="button" 
                    className="auth-demo-chip"
                    onClick={() => quickFill('client')}
                  >
                    Litigant: <strong>dawit</strong>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ─── Register Form ─── */}
          {step === 'form' && tab === 'register' && (
            <form onSubmit={handleRegister} className="auth-form auth-register-form" noValidate>
              {/* Account Type Selector Cards */}
              <div className="auth-field">
                <label className="auth-label">Select Account Type *</label>
                <div className="auth-role-grid">
                  <div 
                    className={`auth-role-card ${regForm.role === 'client' ? 'selected' : ''}`}
                    onClick={() => f('role', 'client')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="auth-role-icon">👤</div>
                    <div className="auth-role-title">Client / Litigant</div>
                    <div className="auth-role-desc">Ask legal questions, find advocates, and rate consultations.</div>
                  </div>

                  <div 
                    className={`auth-role-card ${regForm.role === 'lawyer' ? 'selected' : ''}`}
                    onClick={() => f('role', 'lawyer')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="auth-role-icon">⚖️</div>
                    <div className="auth-role-title">Licensed Advocate</div>
                    <div className="auth-role-desc">Ministry of Justice verified profile, courtroom cases & Q&A answers.</div>
                  </div>
                </div>
              </div>

              {/* Two Column Input Grid */}
              <div className="auth-grid-2col">
                {/* Left Column: Core Credentials */}
                <div className="auth-col">
                  <div className="auth-field">
                    <label className="auth-label">Full Name *</label>
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="e.g. Kebede Haile Mariam"
                      value={regForm.name}
                      onChange={e => f('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Email Address *</label>
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="name@example.et"
                      value={regForm.email}
                      onChange={e => f('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Username *</label>
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="Choose a username"
                      value={regForm.username}
                      onChange={e => f('username', e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Password *</label>
                    <input
                      className="auth-input"
                      type="password"
                      placeholder="Create a secure password"
                      value={regForm.password}
                      onChange={e => f('password', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Right Column: Practice & Contact Info */}
                <div className="auth-col">
                  <div className="auth-field">
                    <label className="auth-label">City / Jurisdiction *</label>
                    <select 
                      className="auth-select" 
                      value={regForm.city} 
                      onChange={e => f('city', e.target.value)}
                    >
                      {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Phone Number</label>
                    <input
                      className="auth-input"
                      type="tel"
                      placeholder="+251 91 100 0000"
                      value={regForm.phone}
                      onChange={e => f('phone', e.target.value)}
                    />
                  </div>

                  {regForm.role === 'lawyer' && (
                    <>
                      <div className="auth-field">
                        <label className="auth-label">Specialization *</label>
                        <select 
                          className="auth-select" 
                          value={regForm.specialization} 
                          onChange={e => f('specialization', e.target.value)}
                        >
                          {SPECIALIZATION_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="auth-field">
                        <label className="auth-label">Years of Experience</label>
                        <input
                          className="auth-input"
                          type="number"
                          min="0"
                          max="60"
                          placeholder="e.g. 12"
                          value={regForm.yearsExperience}
                          onChange={e => f('yearsExperience', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {regForm.role === 'client' && (
                    <div className="auth-field">
                      <label className="auth-label">Languages Spoken</label>
                      <input
                        className="auth-input"
                        type="text"
                        placeholder="Amharic, English, Oromiffa"
                        value={regForm.languages}
                        onChange={e => f('languages', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Advocate MoJ Verification Section */}
              {regForm.role === 'lawyer' && (
                <div className="auth-advocate-highlight">
                  <div className="auth-advocate-badge">
                    <span>Federal Ministry of Justice Verification</span>
                  </div>
                  <div className="auth-grid-2col" style={{ marginTop: '1.2rem' }}>
                    <div className="auth-field">
                      <label className="auth-label">MoJ License Number *</label>
                      <input
                        className="auth-input gold-accent"
                        type="text"
                        placeholder="e.g. LAW-1001"
                        value={regForm.licenseNumber}
                        onChange={e => f('licenseNumber', e.target.value)}
                        required
                      />
                      <span className="auth-hint">Must match official Ministry roll of advocates.</span>
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">Education / Degree</label>
                      <input
                        className="auth-input"
                        type="text"
                        placeholder="e.g. LLB - Addis Ababa University"
                        value={regForm.education}
                        onChange={e => f('education', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="auth-field" style={{ marginTop: '1rem' }}>
                    <label className="auth-label">Professional Bio & Practice Scope</label>
                    <textarea
                      className="auth-textarea"
                      rows={2}
                      placeholder="Briefly describe your courtroom trial experience, cassation matters, and client focus…"
                      value={regForm.bio}
                      onChange={e => f('bio', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-gold btn-full auth-submit-btn" 
                disabled={loading}
              >
                {loading ? 'Creating Account…' : 'Create Account & Send Verification Code'}
              </button>
            </form>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
