import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

const ETHIOPIAN_CITIES = [
  'Addis Ababa','Dire Dawa','Hawassa','Bahir Dar',
  'Mekelle','Gondar','Jimma','Adama','Dessie','Harar'
];
const SPECS = ['Criminal','Corporate','Family','Civil'];
const LAW_TOPICS = [
  { icon:'⚖️', title:'Criminal Law', desc:'Covers offenses against the state and society — from theft and fraud to homicide. Ethiopian criminal procedure is governed by the Criminal Procedure Code (1961) and the Revised Criminal Code (2004).' },
  { icon:'🏢', title:'Corporate & Commercial Law', desc:'Regulates business entities, contracts, mergers, and trade. The Commercial Code of Ethiopia (2021) modernized company registration, partnerships, and securities law.' },
  { icon:'👨‍👩‍👧', title:'Family & Personal Status', desc:'Governs marriage, divorce, child custody, and inheritance. The Federal Family Law (Revised) applies in Addis Ababa; regional states may have their own codes.' },
  { icon:'🏠', title:'Civil & Land Law', desc:'Addresses property rights, land tenure, torts, and contract enforcement. Ethiopia uses a dual land tenure system — state ownership with use-right certificates for citizens.' },
  { icon:'🌍', title:'Constitutional Law', desc:'The FDRE Constitution (1995) is the supreme law. It guarantees fundamental rights, federalism, and the right of nationalities to self-determination.' },
  { icon:'👷', title:'Labour Law', desc:'The Labour Proclamation No. 1156/2019 protects workers\' rights, defines employment contracts, sets minimum conditions, and governs dispute resolution through labour boards.' },
];

// ─── Star Rating ──────────────────────────────────────────────────────────────
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

// ─── ELO Bar ──────────────────────────────────────────────────────────────────
function EloBar({ elo }) {
  const pct = Math.min(100, Math.max(0, ((elo - 800) / 600) * 100));
  const color = elo >= 1200 ? '#f0c040' : elo >= 1100 ? '#7ec8a0' : '#6eaadc';
  return (
    <div style={{ margin: '0.5rem 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'rgba(245,239,226,0.5)', marginBottom:'0.25rem' }}>
        <span>ELO Score</span><span style={{ color, fontWeight:700 }}>{elo}</span>
      </div>
      <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:99, height:6 }}>
        <div style={{ width:`${pct}%`, background:color, borderRadius:99, height:6, transition:'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// ─── Lawyer Detail Modal ──────────────────────────────────────────────────────
function LawyerDetailModal({ lawyer, onClose }) {
  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const winRate = lawyer.casesCount > 0
    ? Math.round((lawyer.casesWon / lawyer.casesCount) * 100)
    : null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Profile of ${lawyer.name}`}>
      <div className="modal detail-modal animate-fade-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
        {/* Header */}
        <div className="detail-modal-header">
          <img
            src={lawyer.profilePic}
            alt={lawyer.name}
            className="detail-modal-avatar"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'; }}
          />
          <div className="detail-modal-info">
            <h2 className="detail-modal-name">{lawyer.name}</h2>
            <span className="lawyer-card-spec" style={{ fontSize:'0.9rem' }}>{lawyer.specialization} Law</span>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem', flexWrap:'wrap' }}>
              <span className="detail-tag">📍 {lawyer.city || 'Addis Ababa'}</span>
              {lawyer.yearsExperience > 0 && <span className="detail-tag">🗓 {lawyer.yearsExperience} yrs exp.</span>}
              {lawyer.licenseNumber && <span className="detail-tag">🔖 {lawyer.licenseNumber}</span>}
            </div>
          </div>
          <button className="modal-close focus-ring" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight:'70vh', overflowY:'auto' }}>
          {/* Rating bar */}
          <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'var(--radius-md)', padding:'1rem', marginBottom:'1rem' }}>
            <EloBar elo={lawyer.elo} />
            <div style={{ display:'flex', gap:'1.5rem', marginTop:'0.75rem' }}>
              <div style={{ textAlign:'center' }}>
                <StarRow rating={lawyer.rating} />
                <div style={{ fontSize:'0.75rem', color:'rgba(245,239,226,0.5)', marginTop:'0.25rem' }}>{lawyer.rating.toFixed(1)} / 5.0 rating</div>
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'1.5rem', fontWeight:700, color:'#7ec8a0' }}>{lawyer.casesWon}</div>
                  <div style={{ fontSize:'0.7rem', color:'rgba(245,239,226,0.45)' }}>Won</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'1.5rem', fontWeight:700, color:'#e07c7c' }}>{lawyer.casesLost}</div>
                  <div style={{ fontSize:'0.7rem', color:'rgba(245,239,226,0.45)' }}>Lost</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'1.5rem', fontWeight:700, color:'rgba(245,239,226,0.8)' }}>{lawyer.casesCount}</div>
                  <div style={{ fontSize:'0.7rem', color:'rgba(245,239,226,0.45)' }}>Total</div>
                </div>
                {winRate !== null && (
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.5rem', fontWeight:700, color:'#f0c040' }}>{winRate}%</div>
                    <div style={{ fontSize:'0.7rem', color:'rgba(245,239,226,0.45)' }}>Win rate</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {lawyer.bio && (
            <div style={{ marginBottom:'1rem' }}>
              <h4 className="detail-section-title">About</h4>
              <p style={{ color:'rgba(245,239,226,0.7)', fontSize:'0.875rem', lineHeight:1.7 }}>{lawyer.bio}</p>
            </div>
          )}

          {/* Education */}
          {lawyer.education && (
            <div style={{ marginBottom:'1rem' }}>
              <h4 className="detail-section-title">🎓 Education</h4>
              <p style={{ color:'rgba(245,239,226,0.7)', fontSize:'0.875rem' }}>{lawyer.education}</p>
            </div>
          )}

          {/* Languages */}
          {lawyer.languages && lawyer.languages.length > 0 && (
            <div style={{ marginBottom:'1rem' }}>
              <h4 className="detail-section-title">🗣 Languages</h4>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                {lawyer.languages.map(lang => (
                  <span key={lang} className="detail-tag">{lang}</span>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          {lawyer.phone && (
            <div style={{ marginBottom:'1rem' }}>
              <h4 className="detail-section-title">📞 Contact</h4>
              <a href={`tel:${lawyer.phone}`} style={{ color:'#6eaadc', fontSize:'0.875rem' }}>{lawyer.phone}</a>
            </div>
          )}

          <div style={{ borderTop:'1px solid rgba(245,239,226,0.08)', paddingTop:'1rem', fontSize:'0.75rem', color:'rgba(245,239,226,0.35)' }}>
            MoJ License: {lawyer.licenseNumber} · Verified Advocate · LEX-RATING Platform
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lawyer Card ──────────────────────────────────────────────────────────────
function LawyerCard({ lawyer, onClick }) {
  return (
    <article className="lawyer-card animate-fade-up" onClick={onClick} style={{ cursor:'pointer' }} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      aria-label={`View profile of ${lawyer.name}`}
    >
      <img
        src={lawyer.profilePic}
        alt={lawyer.name}
        className="lawyer-card-avatar"
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'; }}
      />
      <div className="lawyer-card-body">
        <h3 className="lawyer-card-name">{lawyer.name}</h3>
        <span className="lawyer-card-spec">{lawyer.specialization}</span>
        {lawyer.city && (
          <span style={{ fontSize:'0.75rem', color:'rgba(245,239,226,0.4)', display:'block', marginTop:'0.15rem' }}>📍 {lawyer.city}</span>
        )}
        <div className="lawyer-card-stats">
          <StarRow rating={lawyer.rating} />
          <span className="lawyer-card-rating">{lawyer.rating.toFixed(1)}</span>
          <span className="lawyer-card-cases">{lawyer.casesCount} {lawyer.casesCount === 1 ? 'case' : 'cases'}</span>
          <span className="lawyer-card-elo">{lawyer.elo} ELO</span>
        </div>
        {lawyer.yearsExperience > 0 && (
          <span style={{ fontSize:'0.72rem', color:'rgba(245,239,226,0.35)', marginTop:'0.25rem', display:'block' }}>
            {lawyer.yearsExperience} yrs experience
          </span>
        )}
      </div>
      <div className="lawyer-card-hint">View Profile →</div>
    </article>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onLogin }) {
  const [tab, setTab]       = useState('login');
  const [step, setStep]     = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loginForm, setLoginForm] = useState({ username:'', password:'' });
  const [regForm, setRegForm] = useState({
    name:'', username:'', password:'', email:'', role:'client',
    licenseNumber:'', specialization:'Criminal',
    city:'', phone:'', bio:'', yearsExperience:'', education:'', languages:'',
  });
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleLogin = async e => {
    e.preventDefault(); clearMessages(); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (res.ok) { setSuccess(`Welcome back, ${data.user.name}!`); setTimeout(() => { onLogin(data.user); onClose(); }, 800); }
      else setError(data.error || 'Login failed.');
    } catch { setError('Cannot reach the server.'); } finally { setLoading(false); }
  };

  const handleRegister = async e => {
    e.preventDefault(); clearMessages(); setLoading(true);
    try {
      const payload = { ...regForm, languages: regForm.languages ? regForm.languages.split(',').map(l => l.trim()) : [] };
      const res  = await fetch(`${API_BASE}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) { setOtpEmail(regForm.email); setStep('otp'); setSuccess('A 6-digit verification code has been sent to your email.'); }
      else setError(data.error || 'Registration failed.');
    } catch { setError('Cannot reach the server.'); } finally { setLoading(false); }
  };

  const handleVerify = async e => {
    e.preventDefault(); clearMessages(); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register-verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: otpEmail, code: otpCode }) });
      const data = await res.json();
      if (res.ok) { setSuccess('Account verified! Please sign in.'); setTimeout(() => { setTab('login'); setStep('form'); clearMessages(); }, 1200); }
      else setError(data.error || 'Invalid or expired code.');
    } catch { setError('Cannot reach the server.'); } finally { setLoading(false); }
  };

  const f = (key, val) => setRegForm(p => ({ ...p, [key]: val }));

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal animate-fade-up" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="modal-title">
              {step === 'otp' ? 'Verify your email' : tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="modal-subtitle">
              {step === 'otp' ? `Code sent to ${otpEmail}` : tab === 'login' ? 'Sign in to LEX-RATING' : 'Register with your credentials'}
            </p>
          </div>
          <button className="modal-close focus-ring" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {step === 'form' && (
            <div className="modal-tabs" role="tablist">
              <button role="tab" aria-selected={tab==='login'} className={`modal-tab${tab==='login'?' active':''}`} onClick={() => { setTab('login'); clearMessages(); }}>Sign In</button>
              <button role="tab" aria-selected={tab==='register'} className={`modal-tab${tab==='register'?' active':''}`} onClick={() => { setTab('register'); clearMessages(); }}>Register</button>
            </div>
          )}
          {error   && <div className="alert alert-error" role="alert"><span>⚠</span><span>{error}</span></div>}
          {success && <div className="alert alert-success" role="status"><span>✓</span><span>{success}</span></div>}

          {/* OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerify} noValidate>
              <div className="form-group">
                <label htmlFor="otp-code" className="form-label">6-Digit Code</label>
                <input id="otp-code" type="text" inputMode="numeric" maxLength={6} className="form-input otp-input focus-ring"
                  placeholder="• • • • • •" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g,''))} required autoFocus />
                <p className="form-helper">Check your inbox and spam folder. Expires in 10 minutes.</p>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || otpCode.length !== 6}>
                {loading ? <span className="loading-spinner" /> : 'Verify & Complete Registration'}
              </button>
              <button type="button" className="btn btn-ghost btn-full" style={{ marginTop:'0.5rem' }} onClick={() => { setStep('form'); setOtpCode(''); clearMessages(); }}>← Back</button>
            </form>
          )}

          {/* Login */}
          {step === 'form' && tab === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label htmlFor="login-username" className="form-label">Username or Email</label>
                <input id="login-username" type="text" autoComplete="username" className="form-input focus-ring"
                  placeholder="Your username or email" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Password</label>
                <input id="login-password" type="password" autoComplete="current-password" className="form-input focus-ring"
                  placeholder="Your password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop:'0.5rem' }} disabled={loading}>
                {loading ? <span className="loading-spinner" /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register */}
          {step === 'form' && tab === 'register' && (
            <form onSubmit={handleRegister} noValidate style={{ maxHeight:'60vh', overflowY:'auto', paddingRight:'0.25rem' }}>
              <p style={{ fontSize:'0.78rem', color:'rgba(245,239,226,0.4)', marginBottom:'0.75rem' }}>Fields marked * are required</p>

              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">Full Name *</label>
                <input id="reg-name" type="text" autoComplete="name" className="form-input focus-ring"
                  placeholder="e.g. Kebede Haile Mariam" value={regForm.name} onChange={e => f('name', e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label htmlFor="reg-email" className="form-label">Email *</label>
                <input id="reg-email" type="email" autoComplete="email" className="form-input focus-ring"
                  placeholder="yourname@example.et" value={regForm.email} onChange={e => f('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="reg-username" className="form-label">Username *</label>
                <input id="reg-username" type="text" autoComplete="username" className="form-input focus-ring"
                  placeholder="Choose a username" value={regForm.username} onChange={e => f('username', e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">Password *</label>
                <input id="reg-password" type="password" autoComplete="new-password" className="form-input focus-ring"
                  placeholder="Create a secure password" value={regForm.password} onChange={e => f('password', e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="reg-role" className="form-label">Account Type *</label>
                <select id="reg-role" className="form-select focus-ring" value={regForm.role} onChange={e => f('role', e.target.value)}>
                  <option value="client">Client (Litigant)</option>
                  <option value="lawyer">Advocate (Lawyer)</option>
                </select>
              </div>

              {/* Lawyer-only fields */}
              {regForm.role === 'lawyer' && (
                <div className="license-box">
                  <div className="license-box-title"><span>🔒</span> MoJ License Verification Required</div>
                  <div className="form-group">
                    <label htmlFor="reg-license" className="form-label">License Number *</label>
                    <input id="reg-license" type="text" className="form-input focus-ring" placeholder="e.g. LAW-1001"
                      value={regForm.licenseNumber} onChange={e => f('licenseNumber', e.target.value)} required />
                    <p className="form-helper">Your full name must exactly match the MoJ registry.</p>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-spec" className="form-label">Specialization *</label>
                    <select id="reg-spec" className="form-select focus-ring" value={regForm.specialization} onChange={e => f('specialization', e.target.value)}>
                      {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Optional profile fields */}
              <div style={{ borderTop:'1px solid rgba(245,239,226,0.08)', paddingTop:'0.75rem', marginTop:'0.75rem' }}>
                <p style={{ fontSize:'0.78rem', color:'rgba(245,239,226,0.4)', marginBottom:'0.5rem' }}>Optional — enriches your public profile</p>
                <div className="form-group">
                  <label htmlFor="reg-city" className="form-label">City</label>
                  <select id="reg-city" className="form-select focus-ring" value={regForm.city} onChange={e => f('city', e.target.value)}>
                    <option value="">Select your city</option>
                    {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-phone" className="form-label">Phone Number</label>
                  <input id="reg-phone" type="tel" className="form-input focus-ring" placeholder="+251911..." value={regForm.phone} onChange={e => f('phone', e.target.value)} />
                </div>
                {regForm.role === 'lawyer' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="reg-exp" className="form-label">Years of Experience</label>
                      <input id="reg-exp" type="number" min="0" max="60" className="form-input focus-ring" placeholder="e.g. 8" value={regForm.yearsExperience} onChange={e => f('yearsExperience', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="reg-education" className="form-label">Education</label>
                      <input id="reg-education" type="text" className="form-input focus-ring" placeholder="e.g. LLB – Addis Ababa University" value={regForm.education} onChange={e => f('education', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="reg-languages" className="form-label">Languages (comma-separated)</label>
                      <input id="reg-languages" type="text" className="form-input focus-ring" placeholder="e.g. Amharic, English, Oromiffa" value={regForm.languages} onChange={e => f('languages', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label htmlFor="reg-bio" className="form-label">Bio / Profile Summary</label>
                      <textarea id="reg-bio" className="form-input focus-ring" rows={3} placeholder="Briefly describe your practice and expertise…"
                        value={regForm.bio} onChange={e => f('bio', e.target.value)}
                        style={{ resize:'vertical', fontFamily:'inherit' }} />
                    </div>
                  </>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop:'0.75rem' }} disabled={loading}>
                {loading ? <span className="loading-spinner" /> : 'Create Account & Send OTP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Law Topic Card ───────────────────────────────────────────────────────────
function LawTopicCard({ icon, title, desc }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="law-topic-card" onClick={() => setOpen(o => !o)} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') setOpen(o => !o); }}
      aria-expanded={open}
    >
      <div className="law-topic-header">
        <span className="law-topic-icon">{icon}</span>
        <span className="law-topic-title">{title}</span>
        <span className="law-topic-chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && <p className="law-topic-desc">{desc}</p>}
    </div>
  );
}

// ─── MoJ Preview ─────────────────────────────────────────────────────────────
function MojPreview() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => {
    fetch(`${API_BASE}/moj/licenses`).then(r => r.json())
      .then(d => { if (Array.isArray(d)) setLicenses(d.slice(0, 6)); })
      .catch(() => setLicenses([]))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ padding:'1.5rem', textAlign:'center', color:'rgba(245,239,226,0.4)', fontSize:'0.875rem' }}>Loading registry…</div>;
  if (!licenses.length) return <div style={{ padding:'1.5rem', textAlign:'center', color:'rgba(245,239,226,0.4)', fontSize:'0.875rem' }}>Registry unavailable — start the server.</div>;
  return (
    <div className="moj-list" role="list">
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

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);
  const [showAuth, setShowAuth]   = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLawyer, setSelectedLawyer] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpec, setActiveSpec]   = useState('');
  const [activeCity, setActiveCity]   = useState('');
  const [lawyers, setLawyers]         = useState([]);
  const [loading, setLoading]         = useState(false);

  const fetchLawyers = useCallback(async (spec = '', city = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (spec) params.append('specialization', spec);
      if (city) params.append('city', city);
      const res  = await fetch(`${API_BASE}/lawyers/search?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setLawyers(data);
    } catch { setLawyers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLawyers('', ''); }, [fetchLawyers]);

  const handleSearch = e => {
    const val = e.target.value;
    setSearchQuery(val); setActiveSpec(''); setActiveCity('');
    fetchLawyers(val, '');
  };
  const handleSpecChip = spec => {
    const next = activeSpec === spec ? '' : spec;
    setActiveSpec(next); setSearchQuery('');
    fetchLawyers(next, activeCity);
  };
  const handleCityChip = city => {
    const next = activeCity === city ? '' : city;
    setActiveCity(next); setSearchQuery('');
    fetchLawyers(activeSpec, next);
  };
  const clearAll = () => { setSearchQuery(''); setActiveSpec(''); setActiveCity(''); fetchLawyers('', ''); };
  const logout   = () => { setUser(null); setActiveTab('home'); };

  const hasFilter = searchQuery || activeSpec || activeCity;

  return (
    <div className="app-wrapper">
      {/* ── NAVBAR ── */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          <button className="navbar-logo focus-ring" onClick={() => setActiveTab('home')} aria-label="LEX-RATING home" style={{ border:'none', background:'none' }}>
            <div className="navbar-logo-icon" aria-hidden="true">⚖</div>
            <div className="navbar-logo-text">
              <span className="navbar-logo-title">LEX-RATING</span>
              <span className="navbar-logo-subtitle">B2G Legal Directory · Ethiopia</span>
            </div>
          </button>
          <div className="navbar-nav" role="menubar">
            <button role="menuitem" className={`navbar-nav-link focus-ring${activeTab==='home'?' active':''}`} onClick={() => setActiveTab('home')}>Directory</button>
            <button role="menuitem" className={`navbar-nav-link focus-ring${activeTab==='topics'?' active':''}`} onClick={() => setActiveTab('topics')}>Law Topics</button>
            <button role="menuitem" className={`navbar-nav-link focus-ring${activeTab==='about'?' active':''}`} onClick={() => setActiveTab('about')}>About</button>
          </div>
          <div className="navbar-actions">
            {user ? (
              <>
                <div className="navbar-user">
                  <img src={user.profilePic || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'}
                    alt={user.name} className="navbar-user-avatar"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'; }} />
                  <div className="navbar-user-info">
                    <span className="navbar-user-name">{user.name}</span>
                    <span className="navbar-user-role">{user.role}</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm focus-ring" onClick={logout}>Sign Out</button>
              </>
            ) : (
              <button id="btn-signin" className="btn btn-primary btn-sm focus-ring" onClick={() => setShowAuth(true)}>Sign In</button>
            )}
          </div>
        </div>
      </nav>

      {/* ── MODALS ── */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={u => setUser(u)} />}
      {selectedLawyer && <LawyerDetailModal lawyer={selectedLawyer} onClose={() => setSelectedLawyer(null)} />}

      {/* ══════════════════════════════════════════
          HOME — DIRECTORY
      ══════════════════════════════════════════ */}
      {activeTab === 'home' && (
        <>
          {/* Hero */}
          <section className="hero texture-grain" aria-labelledby="hero-heading">
            <div className="hero-glow-1" aria-hidden="true" />
            <div className="hero-glow-2" aria-hidden="true" />
            <div className="hero-inner">
              <div className="hero-badge" aria-label="Status: Live">
                <span className="hero-badge-dot" aria-hidden="true" />
                Official Ministry of Justice Registry · Ethiopia
              </div>
              <h1 className="hero-title" id="hero-heading">
                Find a <span className="hero-title-accent">verified</span><br />legal advocate
              </h1>
              <p className="hero-subtitle">
                Search MoJ-registered Ethiopian lawyers by specialization and city.
                Compare real-time ELO performance ratings and connect with the right advocate.
              </p>
              <div className="hero-actions">
                <button className="btn btn-gold btn-lg focus-ring"
                  onClick={() => document.getElementById('lawyer-directory')?.scrollIntoView({ behavior:'smooth' })}>
                  Browse Advocates
                </button>
                {!user && (
                  <button className="btn btn-ghost btn-lg focus-ring"
                    style={{ color:'rgba(245,239,226,0.8)', border:'1px solid rgba(245,239,226,0.2)' }}
                    onClick={() => setShowAuth(true)}>
                    Register Account
                  </button>
                )}
              </div>
              <div className="hero-stats" role="list" aria-label="Platform statistics">
                <div className="hero-stat" role="listitem">
                  <div className="hero-stat-value">{lawyers.length}+</div>
                  <div className="hero-stat-label">Verified Advocates</div>
                </div>
                <div className="hero-stat" role="listitem">
                  <div className="hero-stat-value">{ETHIOPIAN_CITIES.length}</div>
                  <div className="hero-stat-label">Cities Covered</div>
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
            <section className="search-section" aria-label="Search lawyers">
              <div className="search-header">
                <h2 className="search-title">Search Legal Advocates</h2>
                <p className="search-subtitle">Filter by specialization, city, or search by name.</p>
              </div>
              <div className="search-bar" role="search">
                <span className="search-bar-icon" aria-hidden="true">🔍</span>
                <input id="search-advocates" type="search" className="search-input focus-ring"
                  placeholder="Search by specialization (Criminal, Corporate, Family, Civil)…"
                  value={searchQuery} onChange={handleSearch} aria-label="Search legal advocates" />
              </div>

              {/* Specialization chips */}
              <div style={{ marginBottom:'0.5rem' }}>
                <p style={{ fontSize:'0.75rem', color:'rgba(245,239,226,0.4)', marginBottom:'0.4rem', paddingLeft:'0.25rem' }}>SPECIALIZATION</p>
                <div className="spec-filters" role="group" aria-label="Filter by specialization">
                  {SPECS.map(spec => (
                    <button key={spec} className={`spec-chip focus-ring${activeSpec===spec?' active':''}`}
                      onClick={() => handleSpecChip(spec)} aria-pressed={activeSpec===spec}>{spec}</button>
                  ))}
                </div>
              </div>

              {/* City chips */}
              <div>
                <p style={{ fontSize:'0.75rem', color:'rgba(245,239,226,0.4)', marginBottom:'0.4rem', paddingLeft:'0.25rem' }}>📍 CITY</p>
                <div className="spec-filters" role="group" aria-label="Filter by city">
                  {ETHIOPIAN_CITIES.map(city => (
                    <button key={city} className={`spec-chip focus-ring${activeCity===city?' active city-chip':' city-chip'}`}
                      onClick={() => handleCityChip(city)} aria-pressed={activeCity===city}>{city}</button>
                  ))}
                </div>
              </div>
            </section>

            {/* Results */}
            <section className="lawyers-section" aria-label="Lawyer directory results">
              <div className="lawyers-header">
                <h2 className="lawyers-count">
                  <span>{lawyers.length}</span>{' '}{lawyers.length === 1 ? 'Advocate' : 'Advocates'} Found
                  {activeCity && <span style={{ fontWeight:400, color:'rgba(245,239,226,0.5)', fontSize:'0.85rem' }}> in {activeCity}</span>}
                </h2>
                {hasFilter && (
                  <button className="btn btn-ghost btn-sm focus-ring" onClick={clearAll}>Clear all ✕</button>
                )}
              </div>
              {loading ? (
                <div className="loading-overlay" role="status" aria-live="polite">
                  <span className="loading-spinner" /><span>Loading advocates…</span>
                </div>
              ) : lawyers.length > 0 ? (
                <div className="lawyers-grid" role="list" aria-label={`${lawyers.length} legal advocates`}>
                  {lawyers.map(lawyer => (
                    <div key={lawyer.id} role="listitem">
                      <LawyerCard lawyer={lawyer} onClick={() => setSelectedLawyer(lawyer)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" role="status">
                  <div className="empty-state-icon" aria-hidden="true">⚖</div>
                  <p className="empty-state-text">No verified advocates found</p>
                  <p className="empty-state-sub">
                    {hasFilter ? 'No results for the selected filters. Try clearing them.' : 'No lawyers registered yet.'}
                  </p>
                  {hasFilter && <button className="btn btn-primary" style={{ marginTop:'1rem' }} onClick={clearAll}>Clear Filters</button>}
                </div>
              )}
            </section>
          </main>
        </>
      )}

      {/* ══════════════════════════════════════════
          LAW TOPICS PAGE
      ══════════════════════════════════════════ */}
      {activeTab === 'topics' && (
        <main>
          <section className="hero texture-grain" style={{ minHeight:'auto', padding:'5rem 0 3rem' }} aria-labelledby="topics-heading">
            <div className="hero-glow-1" aria-hidden="true" />
            <div className="hero-inner" style={{ textAlign:'center' }}>
              <div className="hero-badge">📚 Ethiopian Legal Reference</div>
              <h1 className="hero-title" id="topics-heading" style={{ fontSize:'clamp(2rem,5vw,3rem)' }}>
                Areas of <span className="hero-title-accent">Ethiopian Law</span>
              </h1>
              <p className="hero-subtitle" style={{ maxWidth:600, margin:'0 auto' }}>
                Understand the key legal domains practiced by advocates on this platform.
                Each area is governed by specific proclamations and codes.
              </p>
            </div>
          </section>

          <div className="main-content" style={{ maxWidth:780, paddingTop:'2rem', paddingBottom:'4rem' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {LAW_TOPICS.map(t => <LawTopicCard key={t.title} {...t} />)}
            </div>

            {/* Info box */}
            <div style={{ marginTop:'2.5rem', background:'rgba(245,239,226,0.04)', border:'1px solid rgba(245,239,226,0.1)', borderRadius:'var(--radius-md)', padding:'1.5rem' }}>
              <h3 style={{ color:'rgba(245,239,226,0.8)', marginBottom:'0.75rem', fontSize:'1rem' }}>🏛 Ethiopian Court Hierarchy</h3>
              <div style={{ display:'grid', gap:'0.5rem' }}>
                {[
                  ['Federal Supreme Court','Highest appellate court — cassation bench'],
                  ['Federal High Court','First instance for federal crimes & civil matters'],
                  ['Federal First Instance Court','Basic federal jurisdiction — Addis Ababa'],
                  ['Regional Supreme Courts','Highest court in each regional state'],
                  ['Regional High Courts','Intermediate appellate level'],
                  ['Woreda Courts','First instance at district level'],
                ].map(([name, role]) => (
                  <div key={name} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid rgba(245,239,226,0.06)', fontSize:'0.8125rem' }}>
                    <span style={{ color:'rgba(245,239,226,0.75)', fontWeight:600 }}>{name}</span>
                    <span style={{ color:'rgba(245,239,226,0.4)' }}>{role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign:'center', marginTop:'2.5rem' }}>
              <p style={{ color:'rgba(245,239,226,0.5)', marginBottom:'1rem', fontSize:'0.9rem' }}>Need legal help? Find a verified advocate.</p>
              <button className="btn btn-gold btn-lg focus-ring" onClick={() => setActiveTab('home')}>Browse Advocates →</button>
            </div>
          </div>
        </main>
      )}

      {/* ══════════════════════════════════════════
          ABOUT PAGE
      ══════════════════════════════════════════ */}
      {activeTab === 'about' && (
        <main>
          <section className="about-section texture-grain" aria-labelledby="about-heading">
            <div className="about-inner">
              <div>
                <div className="about-eyebrow"><span>⚖</span> Official B2G Portal · Ethiopia</div>
                <h2 className="about-title" id="about-heading">Transparent, data-driven<br />legal advocacy</h2>
                <p className="about-text">
                  LEX-RATING is Ethiopia's official government-to-business legal directory,
                  connecting litigants with Ministry of Justice verified advocates through
                  real-time ELO performance ratings.
                </p>
                <p className="about-text">
                  Every lawyer holds a verified MoJ license, ensuring accountability and
                  professionalism. Ratings are computed automatically from judge and client
                  scores after each case.
                </p>
                <div className="about-features" role="list">
                  {[
                    { icon:'🔒', text:'Ministry of Justice license verification on registration' },
                    { icon:'📊', text:'Real-time ELO rating engine — updated after every case' },
                    { icon:'⭐', text:'Dual rating system: judge + client performance scores' },
                    { icon:'📍', text:'Location-based search across 10 Ethiopian cities' },
                    { icon:'📧', text:'Email-verified accounts via OTP authentication' },
                    { icon:'📚', text:'Integrated Ethiopian law reference library' },
                  ].map((f,i) => (
                    <div key={i} className="about-feature" role="listitem">
                      <div className="about-feature-icon" aria-hidden="true">{f.icon}</div>
                      <span className="about-feature-text">{f.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:'2.5rem', display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                  <button className="btn btn-gold btn-lg focus-ring" onClick={() => setActiveTab('home')}>Browse Directory</button>
                  {!user && (
                    <button className="btn btn-ghost btn-lg focus-ring"
                      style={{ color:'rgba(245,239,226,0.8)', border:'1px solid rgba(245,239,226,0.2)' }}
                      onClick={() => setShowAuth(true)}>Create Account</button>
                  )}
                </div>
              </div>
              <div>
                <div className="about-card">
                  <h3 className="about-card-title">MoJ Verified Registry <span className="verified-badge">✓ Live</span></h3>
                  <MojPreview />
                </div>
                <div style={{ marginTop:'1.25rem', padding:'1rem', background:'rgba(245,239,226,0.04)', border:'1px solid rgba(245,239,226,0.1)', borderRadius:'var(--radius-md)' }}>
                  <p style={{ fontSize:'0.8125rem', color:'rgba(245,239,226,0.5)', fontFamily:'var(--font-mono)', marginBottom:'0.5rem' }}>API Endpoints</p>
                  {['GET  /api/lawyers/search?specialization=&city=','POST /api/auth/register','POST /api/auth/login','GET  /api/court/lawyer-rating/:id','POST /api/moj/verify-license'].map(ep => (
                    <div key={ep} style={{ fontFamily:'var(--font-mono)', fontSize:'0.73rem', color:'rgba(245,239,226,0.55)', padding:'0.25rem 0', borderBottom:'1px solid rgba(245,239,226,0.06)' }}>{ep}</div>
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
            <span className="footer-link" onClick={() => setActiveTab('topics')}>Law Topics</span>
            <span className="footer-link">Privacy Directive</span>
            <span className="footer-link">Federal Registry</span>
          </nav>
          <span className="footer-copy">© 2026 Ministry of Justice · Court Automation Dept. · Federal Democratic Republic of Ethiopia</span>
        </div>
      </footer>
    </div>
  );
}
