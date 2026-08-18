import React, { useState } from 'react';
import ModalBackdrop from '../../components/common/ModalBackdrop';
import { api } from '../../services/api';
import { storeToken } from '../../utils/storage';
import { ETHIOPIAN_CITIES } from '../../data/constants';

export default function AuthModal({ onClose, onLogin }) {
  const [tab, setTab]           = useState('login');
  const [step, setStep]         = useState('form');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm]   = useState({
    name: '', username: '', password: '', email: '', role: 'client',
    licenseNumber: '', specialization: 'Criminal',
    city: '', phone: '', bio: '', yearsExperience: '', education: '', languages: '',
  });
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode]   = useState('');

  const clear = () => { setError(''); setSuccess(''); };
  const f = (k, v) => setRegForm(p => ({ ...p, [k]: v }));

  const handleLogin = async e => {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      const { ok, data } = await api.login(loginForm);
      if (ok) {
        setSuccess(`Welcome back, ${data.user.name}!`);
        if (data.token) storeToken(data.token);
        setTimeout(() => {
          onLogin(data.user, data.token);
          onClose();
        }, 700);
      } else {
        setError(data.error || 'Login failed. Check your credentials.');
      }
    } catch {
      setError('Cannot reach server on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      const payload = {
        ...regForm,
        languages: regForm.languages ? regForm.languages.split(',').map(l => l.trim()) : []
      };
      const { ok, data } = await api.register(payload);
      if (ok) {
        setOtpEmail(regForm.email);
        setStep('otp');
        setSuccess('Verification code sent to your email.');
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Cannot reach server.');
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
        setSuccess('A new verification code has been sent to your email.');
      } else {
        setError(data.error || 'Failed to resend verification code.');
      }
    } catch {
      setError('Cannot reach server.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async e => {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      const { ok, data } = await api.verifyRegistration({ email: otpEmail, code: otpCode });
      if (ok) {
        setSuccess('Verified! Please sign in.');
        setTimeout(() => {
          setTab('login');
          setStep('form');
          clear();
        }, 1200);
      } else {
        setError(data.error || 'Invalid code.');
      }
    } catch {
      setError('Cannot reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBackdrop className="auth-backdrop" style={{ zIndex: 2000 }} onClose={onClose}>
      <div className="auth-modal" style={{ zIndex: 2001 }} role="dialog" aria-modal="true">
        <div className="auth-modal-header">
          <div className="auth-modal-title">
            {step === 'otp' ? 'Verify your email' : tab === 'login' ? 'Sign in to LEX-RATING' : 'Create your account'}
          </div>
          <div className="auth-modal-sub">
            {step === 'otp' ? `Code sent to ${otpEmail}` : tab === 'login' ? 'Access your legal directory account' : 'Join Ethiopia\'s official legal directory'}
          </div>
          <button className="auth-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {step === 'form' && (
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); clear(); }}>
              Sign In
            </button>
            <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); clear(); }}>
              Register
            </button>
          </div>
        )}

        <div className="auth-body">
          {error   && <div className="alert alert-error">⚠ {error}</div>}
          {success && <div className="alert alert-success">✓ {success}</div>}

          {/* OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerify} noValidate>
              <div className="form-group">
                <label className="form-label">6-Digit Verification Code</label>
                <input
                  className="form-input otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
                <p className="form-helper">Check inbox and spam. Expires in 10 minutes.</p>
              </div>
              <button type="submit" className="btn btn-orange btn-full" disabled={loading || otpCode.length !== 6}>
                {loading ? <span className="loading-spinner" /> : 'Verify & Activate Account'}
              </button>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={handleResendOtp} disabled={resending}>
                  {resending ? 'Sending…' : 'Resend Code'}
                </button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setStep('form'); setOtpCode(''); clear(); }}>
                  ← Back
                </button>
              </div>
            </form>
          )}

          {/* Login */}
          {step === 'form' && tab === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input
                  className="form-input"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter username or email"
                  value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-orange btn-full" style={{ marginTop: '0.4rem' }} disabled={loading}>
                {loading ? <span className="loading-spinner" /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register */}
          {step === 'form' && tab === 'register' && (
            <form onSubmit={handleRegister} noValidate style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Kebede Haile Mariam"
                  value={regForm.name}
                  onChange={e => f('name', e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="yourname@example.et"
                  value={regForm.email}
                  onChange={e => f('email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Choose a username"
                  value={regForm.username}
                  onChange={e => f('username', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Create a secure password"
                  value={regForm.password}
                  onChange={e => f('password', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Type *</label>
                <select className="form-select" value={regForm.role} onChange={e => f('role', e.target.value)}>
                  <option value="client">Client (Litigant)</option>
                  <option value="lawyer">Advocate (Lawyer)</option>
                </select>
              </div>

              {regForm.role === 'lawyer' && (
                <div className="license-box">
                  <div className="license-box-title">🔒 MoJ License Verification Required</div>
                  <div className="form-group">
                    <label className="form-label">License Number *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. LAW-1001"
                      value={regForm.licenseNumber}
                      onChange={e => f('licenseNumber', e.target.value)}
                      required
                    />
                    <p className="form-helper">Your full name must match the MoJ registry exactly.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization *</label>
                    <select className="form-select" value={regForm.specialization} onChange={e => f('specialization', e.target.value)}>
                      {['Criminal', 'Corporate', 'Family', 'Civil'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="form-section-divider">Optional Profile Info</div>
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-select" value={regForm.city} onChange={e => f('city', e.target.value)}>
                  <option value="">Select city</option>
                  {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="+251911..."
                  value={regForm.phone}
                  onChange={e => f('phone', e.target.value)}
                />
              </div>
              {regForm.role === 'lawyer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      max="60"
                      placeholder="e.g. 8"
                      value={regForm.yearsExperience}
                      onChange={e => f('yearsExperience', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Education</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. LLB – Addis Ababa University (2015)"
                      value={regForm.education}
                      onChange={e => f('education', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Languages <span style={{ fontWeight: 400, color: '#777' }}>(comma-separated)</span></label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. Amharic, English, Oromiffa"
                      value={regForm.languages}
                      onChange={e => f('languages', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Briefly describe your practice area and expertise…"
                      value={regForm.bio}
                      onChange={e => f('bio', e.target.value)}
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-orange btn-full" disabled={loading}>
                {loading ? <span className="loading-spinner" /> : 'Create Account & Send OTP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
