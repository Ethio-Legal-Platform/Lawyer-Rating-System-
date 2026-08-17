import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

const ETHIOPIAN_CITIES = [
  'Addis Ababa','Dire Dawa','Hawassa','Bahir Dar',
  'Mekelle','Gondar','Jimma','Adama','Dessie','Harar'
];

const PRACTICE_AREAS = [
  { icon:'⚖️', label:'Criminal',    spec:'Criminal' },
  { icon:'🏢', label:'Corporate',   spec:'Corporate' },
  { icon:'👨‍👩‍👧', label:'Family',     spec:'Family' },
  { icon:'🏠', label:'Civil',       spec:'Civil' },
  { icon:'💼', label:'Employment',  spec:'' },
  { icon:'🌍', label:'Immigration', spec:'' },
  { icon:'🏥', label:'Medical',     spec:'' },
  { icon:'🚗', label:'Personal Injury', spec:'' },
];

const QA_DATA = [
  { id:1, tag:'Criminal', question:'Can I be charged without evidence? What does "beyond reasonable doubt" mean?', answers:4, time:'2 hrs ago' },
  { id:2, tag:'Family', question:'My spouse refuses divorce — can the court grant it without consent?', answers:7, time:'5 hrs ago' },
  { id:3, tag:'Corporate', question:'What documents are required to register a PLC in Ethiopia?', answers:3, time:'1 day ago' },
  { id:4, tag:'Civil', question:'My landlord is evicting me without notice. What are my rights?', answers:5, time:'2 days ago' },
  { id:5, tag:'Labour', question:'My employer withheld 2 months of salary — what legal action can I take?', answers:9, time:'3 days ago' },
  { id:6, tag:'Immigration', question:'How long does a work permit renewal take in Ethiopia?', answers:2, time:'4 days ago' },
];

const GUIDE_COLORS = ['#f55d25','#008cc9','#52a304','#8b5cf6','#ed4f4b','#fc9835'];
const GUIDES_DATA = [
  { cat:'Criminal Law', title:'Your Rights When Arrested Under Ethiopian Law', read:'5 min read', color: GUIDE_COLORS[0] },
  { cat:'Family Law', title:'Understanding Divorce Procedures in Ethiopia', read:'8 min read', color: GUIDE_COLORS[1] },
  { cat:'Corporate Law', title:'How to Register a Business in Ethiopia (2026 Guide)', read:'6 min read', color: GUIDE_COLORS[2] },
  { cat:'Civil Law', title:'Land Rights and Title Deeds: What Every Ethiopian Must Know', read:'7 min read', color: GUIDE_COLORS[3] },
  { cat:'Labour Law', title:'Employee Rights Under Proclamation No. 1156/2019', read:'5 min read', color: GUIDE_COLORS[4] },
  { cat:'Constitutional', title:'Your Fundamental Rights Under the FDRE Constitution', read:'10 min read', color: GUIDE_COLORS[5] },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function eloToRating(elo) {
  // Map ELO 800–1600 → 1–10
  const r = ((elo - 800) / 800) * 9 + 1;
  return Math.min(10, Math.max(1, parseFloat(r.toFixed(1))));
}
function ratingColor(r) {
  if (r >= 8) return 'excellent';
  if (r >= 6) return 'good';
  if (r >= 4) return 'average';
  return 'low';
}
function StarRow({ rating, max = 5 }) {
  const filled = Math.round(rating);
  return (
    <span className="lawyer-card-stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star${i < filled ? '' : ' empty'}`}>★</span>
      ))}
    </span>
  );
}

// ─── ELO Bar ──────────────────────────────────────────────────────────────────
function EloBar({ elo }) {
  const pct = Math.min(100, Math.max(0, ((elo - 800) / 600) * 100));
  const color = elo >= 1200 ? '#f59e0b' : elo >= 1100 ? '#52a304' : '#008cc9';
  return (
    <div className="elo-bar-wrap">
      <div className="elo-bar-header">
        <span>ELO Rating</span><strong style={{ color }}>{elo}</strong>
      </div>
      <div className="elo-bar-track">
        <div className="elo-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Lawyer Detail Modal ──────────────────────────────────────────────────────
function LawyerModal({ lawyer, onClose }) {
  const [tab, setTab] = useState('overview');
  const avvoRating = eloToRating(lawyer.elo);
  const ratingClass = ratingColor(avvoRating);
  const winRate = lawyer.casesCount > 0
    ? Math.round((lawyer.casesWon / lawyer.casesCount) * 100)
    : null;

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="lawyer-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Hero header */}
        <div className="lawyer-modal-hero">
          <img
            src={lawyer.profilePic}
            alt={lawyer.name}
            className="lawyer-modal-photo"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'; }}
          />
          <div className="lawyer-modal-info">
            <div className="lawyer-modal-name">{lawyer.name}</div>
            <div className="lawyer-modal-spec">{lawyer.specialization} Law · {lawyer.yearsExperience > 0 ? `${lawyer.yearsExperience} years exp.` : 'Verified Advocate'}</div>
            <div className="lawyer-modal-tags">
              <span className="lawyer-modal-tag">📍 {lawyer.city || 'Ethiopia'}</span>
              <span className="lawyer-modal-tag">🔖 {lawyer.licenseNumber}</span>
              <span className={`lawyer-modal-tag`} style={{ background: avvoRating >= 8 ? '#52a304' : avvoRating >= 6 ? '#8bc34a' : '#fc9835', border: 'none' }}>
                ★ {avvoRating} / 10
              </span>
            </div>
          </div>
          <button className="lawyer-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        <div className="lawyer-modal-tabs">
          {['overview','background'].map(t => (
            <button key={t} className={`lawyer-modal-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? 'Overview' : 'Background'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="lawyer-modal-body">
          {tab === 'overview' && (
            <>
              {/* Stats */}
              <div className="modal-stats-row">
                <div className="modal-stat-box">
                  <span className="modal-stat-num green">{lawyer.casesWon}</span>
                  <span className="modal-stat-label">Cases Won</span>
                </div>
                <div className="modal-stat-box">
                  <span className="modal-stat-num red">{lawyer.casesLost}</span>
                  <span className="modal-stat-label">Cases Lost</span>
                </div>
                <div className="modal-stat-box">
                  <span className="modal-stat-num blue">{lawyer.casesCount}</span>
                  <span className="modal-stat-label">Total Cases</span>
                </div>
                {winRate !== null && (
                  <div className="modal-stat-box">
                    <span className="modal-stat-num gold">{winRate}%</span>
                    <span className="modal-stat-label">Win Rate</span>
                  </div>
                )}
              </div>

              <EloBar elo={lawyer.elo} />

              {/* Star rating */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', margin:'1.2rem 0', fontSize:'1.4rem', color:'#555' }}>
                <StarRow rating={lawyer.rating} />
                <span>{lawyer.rating.toFixed(1)} average performance rating</span>
              </div>

              {/* Bio */}
              {lawyer.bio && (
                <div className="modal-section">
                  <div className="modal-section-title">About</div>
                  <p className="modal-section-text">{lawyer.bio}</p>
                </div>
              )}

              {/* Contact */}
              {lawyer.phone && (
                <div className="modal-section">
                  <div className="modal-section-title">Contact</div>
                  <p className="modal-section-text" style={{ fontWeight:700 }}>
                    📞 <a href={`tel:${lawyer.phone}`}>{lawyer.phone}</a>
                  </p>
                </div>
              )}

              <button className="modal-contact-btn" onClick={() => alert('Contact feature requires backend integration (email/messaging system).')}>
                📨 Send a Message
              </button>
              <button className="modal-contact-btn" style={{ background:'#fff', color:'#f55d25', border:'2px solid #f55d25', marginTop:'0.8rem' }}
                onClick={() => alert('Free consultation request sent! (requires messaging backend)')}>
                Schedule Free Consultation
              </button>
            </>
          )}

          {tab === 'background' && (
            <>
              {lawyer.education && (
                <div className="modal-section">
                  <div className="modal-section-title">🎓 Education</div>
                  <p className="modal-section-text">{lawyer.education}</p>
                </div>
              )}
              {lawyer.languages && lawyer.languages.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">🗣 Languages</div>
                  <div className="lang-pills">
                    {lawyer.languages.map(l => <span key={l} className="lang-pill">{l}</span>)}
                  </div>
                </div>
              )}
              <div className="modal-section">
                <div className="modal-section-title">📋 License & Credentials</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem', fontSize:'1.35rem', color:'#555' }}>
                  {[
                    ['License Number', lawyer.licenseNumber],
                    ['Specialization', lawyer.specialization],
                    ['Years of Experience', lawyer.yearsExperience > 0 ? `${lawyer.yearsExperience} years` : 'N/A'],
                    ['City', lawyer.city || 'Addis Ababa'],
                    ['ELO Score', lawyer.elo],
                    ['Platform Rating', `${eloToRating(lawyer.elo)} / 10`],
                  ].map(([k,v]) => (
                    <div key={k} style={{ background:'#f9f9f9', border:'1px solid rgba(0,0,0,0.08)', borderRadius:4, padding:'0.8rem 1rem' }}>
                      <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#777', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.2rem' }}>{k}</div>
                      <div style={{ fontWeight:600, color:'#333' }}>{v || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-section" style={{ background:'#fffbf5', border:'1px solid #ffd09b', borderRadius:6, padding:'1.2rem' }}>
                <div style={{ fontSize:'1.3rem', color:'#92400e', fontWeight:600 }}>
                  ✅ MoJ Verified · All credentials verified by Ministry of Justice, Ethiopia
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onLogin }) {
  const [tab, setTab]           = useState('login');
  const [step, setStep]         = useState('form');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loginForm, setLoginForm] = useState({ username:'', password:'' });
  const [regForm, setRegForm]   = useState({
    name:'', username:'', password:'', email:'', role:'client',
    licenseNumber:'', specialization:'Criminal',
    city:'', phone:'', bio:'', yearsExperience:'', education:'', languages:'',
  });
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode]   = useState('');
  const clear = () => { setError(''); setSuccess(''); };
  const f = (k, v) => setRegForm(p => ({ ...p, [k]: v }));

  const handleLogin = async e => {
    e.preventDefault(); clear(); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (res.ok) { setSuccess(`Welcome back, ${data.user.name}!`); setTimeout(() => { onLogin(data.user); onClose(); }, 700); }
      else setError(data.error || 'Login failed. Check your credentials.');
    } catch { setError('Cannot reach server on port 5000.'); } finally { setLoading(false); }
  };

  const handleRegister = async e => {
    e.preventDefault(); clear(); setLoading(true);
    try {
      const payload = { ...regForm, languages: regForm.languages ? regForm.languages.split(',').map(l => l.trim()) : [] };
      const res  = await fetch(`${API_BASE}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) { setOtpEmail(regForm.email); setStep('otp'); setSuccess('Verification code sent to your email.'); }
      else setError(data.error || 'Registration failed.');
    } catch { setError('Cannot reach server.'); } finally { setLoading(false); }
  };

  const handleVerify = async e => {
    e.preventDefault(); clear(); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register-verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: otpEmail, code: otpCode }) });
      const data = await res.json();
      if (res.ok) { setSuccess('Verified! Please sign in.'); setTimeout(() => { setTab('login'); setStep('form'); clear(); }, 1200); }
      else setError(data.error || 'Invalid code.');
    } catch { setError('Cannot reach server.'); } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
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
            <button className={`auth-tab${tab==='login'?' active':''}`} onClick={() => { setTab('login'); clear(); }}>Sign In</button>
            <button className={`auth-tab${tab==='register'?' active':''}`} onClick={() => { setTab('register'); clear(); }}>Register</button>
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
                <input className="form-input otp-input" type="text" inputMode="numeric" maxLength={6}
                  placeholder="••••••" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g,''))} required autoFocus />
                <p className="form-helper">Check inbox and spam. Expires in 10 minutes.</p>
              </div>
              <button type="submit" className="btn btn-orange btn-full" disabled={loading || otpCode.length !== 6}>
                {loading ? <span className="loading-spinner" /> : 'Verify & Activate Account'}
              </button>
              <button type="button" className="btn btn-ghost btn-full" style={{ marginTop:'0.8rem' }} onClick={() => { setStep('form'); setOtpCode(''); clear(); }}>← Back</button>
            </form>
          )}

          {/* Login */}
          {step === 'form' && tab === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label className="form-label">Username or Email</label>
                <input className="form-input" type="text" autoComplete="username" placeholder="Enter username or email"
                  value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" autoComplete="current-password" placeholder="Enter password"
                  value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-orange btn-full" style={{ marginTop:'0.4rem' }} disabled={loading}>
                {loading ? <span className="loading-spinner" /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register */}
          {step === 'form' && tab === 'register' && (
            <form onSubmit={handleRegister} noValidate style={{ maxHeight:'55vh', overflowY:'auto', paddingRight:'0.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" type="text" placeholder="e.g. Kebede Haile Mariam" value={regForm.name} onChange={e => f('name', e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="yourname@example.et" value={regForm.email} onChange={e => f('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-input" type="text" placeholder="Choose a username" value={regForm.username} onChange={e => f('username', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Create a secure password" value={regForm.password} onChange={e => f('password', e.target.value)} required />
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
                    <input className="form-input" type="text" placeholder="e.g. LAW-1001"
                      value={regForm.licenseNumber} onChange={e => f('licenseNumber', e.target.value)} required />
                    <p className="form-helper">Your full name must match the MoJ registry exactly.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization *</label>
                    <select className="form-select" value={regForm.specialization} onChange={e => f('specialization', e.target.value)}>
                      {['Criminal','Corporate','Family','Civil'].map(s => <option key={s} value={s}>{s}</option>)}
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
                <input className="form-input" type="tel" placeholder="+251911..." value={regForm.phone} onChange={e => f('phone', e.target.value)} />
              </div>
              {regForm.role === 'lawyer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input className="form-input" type="number" min="0" max="60" placeholder="e.g. 8" value={regForm.yearsExperience} onChange={e => f('yearsExperience', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Education</label>
                    <input className="form-input" type="text" placeholder="e.g. LLB – Addis Ababa University (2015)" value={regForm.education} onChange={e => f('education', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Languages <span style={{fontWeight:400, color:'#777'}}>(comma-separated)</span></label>
                    <input className="form-input" type="text" placeholder="e.g. Amharic, English, Oromiffa" value={regForm.languages} onChange={e => f('languages', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" placeholder="Briefly describe your practice area and expertise…" value={regForm.bio} onChange={e => f('bio', e.target.value)} />
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
    </div>
  );
}

// ─── MoJ Registry mini preview ────────────────────────────────────────────────
function MojPreview() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API_BASE}/moj/licenses`).then(r => r.json())
      .then(d => { if (Array.isArray(d)) setLicenses(d.slice(0, 6)); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ padding:'2rem', textAlign:'center', color:'#777' }}>Loading registry…</div>;
  return (
    <div>
      {licenses.map(lic => (
        <div key={lic.licenseNumber} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.8rem 0', borderBottom:'1px solid rgba(0,0,0,0.07)', fontSize:'1.35rem' }}>
          <span style={{ background:'#e8f4fb', color:'#005a9e', padding:'0.2rem 0.7rem', borderRadius:99, fontWeight:700, fontSize:'1.2rem', flexShrink:0 }}>{lic.licenseNumber}</span>
          <span style={{ fontWeight:600, color:'#333', flex:1 }}>{lic.fullName}</span>
          <span style={{ color:'#777', fontSize:'1.2rem' }}>{lic.specialization}</span>
          <span style={{ color:'#52a304', fontWeight:700, fontSize:'1.2rem' }}>✓</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]                 = useState(null);
  const [showAuth, setShowAuth]         = useState(false);
  const [page, setPage]                 = useState('home'); // 'home'|'directory'|'guides'|'about'
  const [selectedLawyer, setSelectedLawyer] = useState(null);

  // Directory state
  const [lawyers, setLawyers]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searchSpec, setSearchSpec]     = useState('');
  const [searchCity, setSearchCity]     = useState('');
  const [specInput, setSpecInput]       = useState('');
  const [cityInput, setCityInput]       = useState('');

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

  const doSearch = () => { setSearchSpec(specInput); setSearchCity(cityInput); fetchLawyers(specInput, cityInput); setPage('directory'); };
  const handleSpecChip = spec => { const n = searchSpec === spec ? '' : spec; setSearchSpec(n); setSpecInput(n); fetchLawyers(n, searchCity); };
  const handleCityChip = city => { const n = searchCity === city ? '' : city; setSearchCity(n); setCityInput(n); fetchLawyers(searchSpec, n); };
  const clearFilters = () => { setSearchSpec(''); setSearchCity(''); setSpecInput(''); setCityInput(''); fetchLawyers('', ''); };
  const handlePracticeCard = area => {
    if (!area.spec) return;
    setSearchSpec(area.spec); setSpecInput(area.spec); setSearchCity(''); setCityInput('');
    fetchLawyers(area.spec, '');
    setPage('directory');
  };
  const logout = () => { setUser(null); };

  const hasFilter = searchSpec || searchCity;

  return (
    <div>
      {/* ── NAV ── */}
      <nav className="avvo-nav">
        <div className="avvo-nav-inner">
          <button className="avvo-logo" onClick={() => setPage('home')} style={{ background:'none', border:'none' }}>
            <span className="avvo-logo-icon">⚖</span>
            <span>LEX-RATING</span>
          </button>
          <div className="avvo-nav-links">
            <button className={`avvo-nav-link${page==='directory'?' active':''}`} onClick={() => setPage('directory')}>Find a Lawyer</button>
            <button className={`avvo-nav-link${page==='qa'?' active':''}`} onClick={() => setPage('qa')}>Legal Q&A</button>
            <button className={`avvo-nav-link${page==='guides'?' active':''}`} onClick={() => setPage('guides')}>Legal Guides</button>
            <button className={`avvo-nav-link${page==='about'?' active':''}`} onClick={() => setPage('about')}>About</button>
          </div>
          <div className="avvo-nav-actions">
            {user ? (
              <>
                <div className="avvo-nav-user">
                  <img src={user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                    alt={user.name} className="avvo-nav-avatar"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'; }} />
                  <span className="avvo-nav-username">{user.name}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAuth(true)}>Sign In</button>
                <button className="btn btn-primary btn-sm" onClick={() => { setShowAuth(true); }}>For Lawyers</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── MODALS ── */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={u => setUser(u)} />}
      {selectedLawyer && <LawyerModal lawyer={selectedLawyer} onClose={() => setSelectedLawyer(null)} />}

      {/* ══════════════════════════════════════════ HOME ══════════════════════════ */}
      {page === 'home' && (
        <>
          {/* Hero */}
          <section className="avvo-hero">
            <div className="avvo-hero-tag">🇪🇹 Official Ministry of Justice Registry</div>
            <h1>Legal. <em>Easier.</em></h1>
            <p className="avvo-hero-sub">
              Find MoJ-verified Ethiopian lawyers by practice area and city. Compare live ELO ratings, read profiles, and connect instantly.
            </p>

            {/* Dual search bar */}
            <div className="avvo-search-box">
              <div className="avvo-search-field">
                <span className="avvo-search-icon">⚖</span>
                <input className="avvo-search-input" type="text" list="spec-list"
                  placeholder="Practice area (Criminal, Family…)"
                  value={specInput}
                  onChange={e => setSpecInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
                />
                <datalist id="spec-list">
                  {['Criminal','Corporate','Family','Civil'].map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="avvo-search-field">
                <span className="avvo-search-icon">📍</span>
                <input className="avvo-search-input" type="text" list="city-list"
                  placeholder="City (Addis Ababa, Hawassa…)"
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
                />
                <datalist id="city-list">
                  {ETHIOPIAN_CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <button className="avvo-search-btn" onClick={doSearch}>Find Lawyers</button>
            </div>

            {/* Hero stats */}
            <div className="avvo-hero-stats">
              {[
                [`${lawyers.length}+`, 'Verified Advocates'],
                ['10', 'Ethiopian Cities'],
                ['4', 'Practice Areas'],
                ['ELO', 'Live Performance Ratings'],
              ].map(([num, label]) => (
                <div key={label} className="avvo-hero-stat">
                  <span className="avvo-hero-stat-num">{num}</span>
                  <span className="avvo-hero-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Practice Area Grid */}
          <section className="avvo-section avvo-section-white">
            <div className="container">
              <h2 className="avvo-section-title">Browse by Practice Area</h2>
              <p className="avvo-section-sub">Find verified lawyers specializing in your legal need.</p>
              <div className="practice-grid">
                {PRACTICE_AREAS.map(area => (
                  <div key={area.label} className={`practice-card${searchSpec === area.spec && area.spec ? ' active' : ''}`}
                    onClick={() => handlePracticeCard(area)}>
                    <span className="practice-card-icon">{area.icon}</span>
                    <span className="practice-card-label">{area.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="avvo-section avvo-section-gray">
            <div className="container">
              <h2 className="avvo-section-title" style={{ textAlign:'center' }}>How LEX-RATING Works</h2>
              <p className="avvo-section-sub" style={{ textAlign:'center' }}>Three simple steps to finding your advocate.</p>
              <div className="how-strip">
                {[
                  { num:'1', title:'Search', desc:'Enter your legal issue and city. Filter by specialization to narrow results instantly.' },
                  { num:'2', title:'Compare', desc:'Review live ELO performance ratings, case win rates, education, and client reviews.' },
                  { num:'3', title:'Connect', desc:'Message or call the lawyer directly. All advocates are MoJ-verified and licensed.' },
                ].map(s => (
                  <div key={s.num} className="how-step">
                    <div className="how-step-num">{s.num}</div>
                    <div className="how-step-title">{s.title}</div>
                    <p className="how-step-desc">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trust Bar */}
          <div className="trust-bar">
            <div className="trust-bar-inner">
              {[
                ['12', 'MoJ-Verified Advocates'],
                ['10+', 'Court Cases Rated'],
                ['10', 'Cities Covered'],
                ['1–10', 'Transparent ELO Rating'],
              ].map(([num, label]) => (
                <div key={label} className="trust-stat">
                  <span className="trust-stat-num">{num}</span>
                  <span className="trust-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Lawyers */}
          <section className="avvo-section avvo-section-white">
            <div className="container">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem', marginBottom:'2.4rem' }}>
                <div>
                  <h2 className="avvo-section-title" style={{ marginBottom:'0.3rem' }}>Top-Rated Advocates</h2>
                  <p className="avvo-section-sub" style={{ marginBottom:0 }}>Sorted by ELO performance rating.</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage('directory')}>View All →</button>
              </div>
              {loading ? (
                <div className="loading-state">Loading advocates <span className="loading-dots"><span/><span/><span/></span></div>
              ) : (
                <div className="lawyers-grid">
                  {lawyers.slice(0, 6).map(lawyer => (
                    <LawyerCardComponent key={lawyer.id} lawyer={lawyer} onClick={() => setSelectedLawyer(lawyer)} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Q&A Preview */}
          <section className="avvo-section avvo-section-gray">
            <div className="container">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem', marginBottom:'0.4rem' }}>
                <div>
                  <h2 className="avvo-section-title" style={{ marginBottom:'0.3rem' }}>Legal Q&A</h2>
                  <p className="avvo-section-sub" style={{ marginBottom:0 }}>Real questions, answered by verified Ethiopian lawyers.</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage('qa')}>See All Questions →</button>
              </div>
              <div className="qa-grid">
                {QA_DATA.slice(0, 3).map(q => (
                  <div key={q.id} className="qa-card" onClick={() => setPage('qa')}>
                    <span className="qa-tag">{q.tag}</span>
                    <p className="qa-question">{q.question}</p>
                    <div className="qa-meta">
                      <span className="qa-answers">✓ {q.answers} answers</span>
                      <span>{q.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Legal Guides */}
          <section className="avvo-section avvo-section-white">
            <div className="container">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem', marginBottom:'0.4rem' }}>
                <div>
                  <h2 className="avvo-section-title" style={{ marginBottom:'0.3rem' }}>Legal Guides</h2>
                  <p className="avvo-section-sub" style={{ marginBottom:0 }}>Understand your rights under Ethiopian law.</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage('guides')}>All Guides →</button>
              </div>
              <div className="guides-grid">
                {GUIDES_DATA.slice(0, 3).map(g => (
                  <div key={g.title} className="guide-card" onClick={() => setPage('guides')}>
                    <div className="guide-card-color" style={{ background: g.color }} />
                    <div className="guide-card-body">
                      <div className="guide-cat">{g.cat}</div>
                      <div className="guide-title">{g.title}</div>
                      <div className="guide-read">📖 {g.read}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Attorney CTA */}
          {!user && (
            <div className="attorney-cta">
              <h2>Are you an Ethiopian lawyer?</h2>
              <p>Join LEX-RATING to grow your practice, receive MoJ-verified status, and connect with thousands of litigants across Ethiopia.</p>
              <button className="btn btn-white btn-lg" onClick={() => setShowAuth(true)}>Register as an Advocate →</button>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════ DIRECTORY ═════════════════════ */}
      {page === 'directory' && (
        <div className="dir-layout">
          {/* Sidebar */}
          <aside className="dir-sidebar">
            <h3>Practice Area</h3>
            <ul className="sidebar-spec-list">
              <li className={`sidebar-spec-item${!searchSpec?' active':''}`} onClick={() => { setSearchSpec(''); setSpecInput(''); fetchLawyers('', searchCity); }}>
                <span className="sidebar-spec-icon">📋</span> All Areas
              </li>
              {[
                { icon:'⚖️', spec:'Criminal' },
                { icon:'🏢', spec:'Corporate' },
                { icon:'👨‍👩‍👧', spec:'Family' },
                { icon:'🏠', spec:'Civil' },
              ].map(item => (
                <li key={item.spec} className={`sidebar-spec-item${searchSpec===item.spec?' active':''}`}
                  onClick={() => { setSearchSpec(item.spec); setSpecInput(item.spec); fetchLawyers(item.spec, searchCity); }}>
                  <span className="sidebar-spec-icon">{item.icon}</span> {item.spec}
                </li>
              ))}
            </ul>

            <h3 style={{ marginTop:'1.6rem' }}>City</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
              {['', ...ETHIOPIAN_CITIES].map(city => (
                <label key={city} style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'1.35rem', cursor:'pointer', padding:'0.4rem 0.6rem', borderRadius:4, background: searchCity===city && city ? '#fff4f0' : 'transparent', color: searchCity===city && city ? '#f55d25' : '#555', fontWeight: searchCity===city && city ? 700 : 400 }}>
                  <input type="radio" name="city" checked={searchCity===city}
                    onChange={() => { setSearchCity(city); setCityInput(city); fetchLawyers(searchSpec, city); }}
                    style={{ accentColor:'#f55d25' }} />
                  {city || 'All Cities'}
                </label>
              ))}
            </div>
          </aside>

          {/* Main */}
          <div>
            {/* Search bar */}
            <div className="dir-search-wrap">
              <div className="dir-search-row">
                <div className="dir-search-field" style={{ flex:2 }}>
                  <span className="dir-search-icon">⚖</span>
                  <input type="text" placeholder="Practice area…" value={specInput} list="spec-list2"
                    onChange={e => { setSpecInput(e.target.value); setSearchSpec(e.target.value); fetchLawyers(e.target.value, searchCity); }} />
                  <datalist id="spec-list2">
                    {['Criminal','Corporate','Family','Civil'].map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div className="dir-search-field" style={{ flex:2 }}>
                  <span className="dir-search-icon">📍</span>
                  <input type="text" placeholder="City…" value={cityInput} list="city-list2"
                    onChange={e => { setCityInput(e.target.value); setSearchCity(e.target.value); fetchLawyers(searchSpec, e.target.value); }} />
                  <datalist id="city-list2">
                    {ETHIOPIAN_CITIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                {hasFilter && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear ✕</button>}
              </div>

              <div className="filter-chips">
                {['Criminal','Corporate','Family','Civil'].map(s => (
                  <button key={s} className={`filter-chip${searchSpec===s?' active':''}`} onClick={() => handleSpecChip(s)}>{s}</button>
                ))}
                <span style={{ borderLeft:'1px solid #e0e0e0', margin:'0 0.4rem', alignSelf:'stretch' }} />
                {ETHIOPIAN_CITIES.map(c => (
                  <button key={c} className={`filter-chip city${searchCity===c?' active':''}`} onClick={() => handleCityChip(c)}>{c}</button>
                ))}
              </div>
            </div>

            <div className="results-header">
              <p className="results-count"><strong>{lawyers.length}</strong> advocates found{searchCity ? ` in ${searchCity}` : ''}{searchSpec ? ` · ${searchSpec}` : ''}</p>
              {hasFilter && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all filters ✕</button>}
            </div>

            {loading ? (
              <div className="loading-state">Loading advocates <span className="loading-dots"><span/><span/><span/></span></div>
            ) : lawyers.length > 0 ? (
              <div className="lawyers-grid">
                {lawyers.map(lawyer => (
                  <LawyerCardComponent key={lawyer.id} lawyer={lawyer} onClick={() => setSelectedLawyer(lawyer)} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">⚖</span>
                <p className="empty-title">No advocates found</p>
                <p className="empty-sub">Try adjusting your filters or clearing them to see all lawyers.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════ Q&A ═══════════════════════════ */}
      {page === 'qa' && (
        <section className="avvo-section avvo-section-gray" style={{ minHeight:'60vh' }}>
          <div className="container">
            <h1 className="avvo-section-title">Legal Q&A</h1>
            <p className="avvo-section-sub">Browse questions answered by MoJ-verified Ethiopian lawyers.</p>
            <div style={{ background:'#fff4f0', border:'1px solid #ffd0b0', borderRadius:6, padding:'1.2rem 1.6rem', marginBottom:'2.4rem', fontSize:'1.4rem', color:'#92400e' }}>
              💡 <strong>Q&A posting requires a backend.</strong> Tell me to implement it and I'll add routes + data model for questions and answers.
            </div>
            <div className="qa-grid" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {QA_DATA.map(q => (
                <div key={q.id} className="qa-card">
                  <span className="qa-tag">{q.tag}</span>
                  <p className="qa-question">{q.question}</p>
                  <div className="qa-meta">
                    <span className="qa-answers">✓ {q.answers} answers</span>
                    <span>{q.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════ GUIDES ════════════════════════ */}
      {page === 'guides' && (
        <section className="avvo-section avvo-section-gray" style={{ minHeight:'60vh' }}>
          <div className="container">
            <h1 className="avvo-section-title">Legal Guides</h1>
            <p className="avvo-section-sub">Plain-language explanations of Ethiopian law, written for everyone.</p>
            <div className="guides-grid" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {GUIDES_DATA.map(g => (
                <div key={g.title} className="guide-card">
                  <div className="guide-card-color" style={{ background: g.color }} />
                  <div className="guide-card-body">
                    <div className="guide-cat">{g.cat}</div>
                    <div className="guide-title">{g.title}</div>
                    <div className="guide-read">📖 {g.read}</div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop:'1rem' }}
                      onClick={() => alert('Full article content requires a CMS/backend. Tell me to implement it!')}>
                      Read Guide →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════ ABOUT ═════════════════════════ */}
      {page === 'about' && (
        <section className="avvo-section avvo-section-white" style={{ minHeight:'60vh' }}>
          <div className="container" style={{ maxWidth:800 }}>
            <h1 className="avvo-section-title">About LEX-RATING</h1>
            <p style={{ fontSize:'1.6rem', color:'#555', lineHeight:1.7, marginBottom:'2rem' }}>
              LEX-RATING is Ethiopia's official B2G (Business-to-Government) legal directory, connecting litigants with Ministry of Justice verified advocates through transparent, real-time ELO performance ratings.
            </p>
            <p style={{ fontSize:'1.5rem', color:'#555', lineHeight:1.7, marginBottom:'2rem' }}>
              Every lawyer listed has a verified MoJ license. After each court case, our ELO engine automatically updates advocate ratings based on judge scores, client feedback, and case outcomes — ensuring accountability at every level.
            </p>
            <div style={{ background:'#f9f9f9', border:'1px solid rgba(0,0,0,0.1)', borderRadius:8, padding:'2rem', marginBottom:'2rem' }}>
              <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'1.8rem', fontWeight:800, marginBottom:'1.6rem' }}>MoJ Verified Registry</h2>
              <MojPreview />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.2rem' }}>
              {[
                { icon:'🔒', title:'MoJ Verification', text:'All lawyers verified against the Ministry of Justice license registry.' },
                { icon:'📊', title:'ELO Rating Engine', text:'Live ratings computed from court outcomes, judge scores, and client feedback.' },
                { icon:'📍', title:'Location Search', text:'Find advocates in 10 Ethiopian cities with city-specific filtering.' },
                { icon:'📧', title:'OTP Authentication', text:'Secure email-verified account creation for all users.' },
              ].map(f => (
                <div key={f.title} style={{ padding:'1.6rem', background:'#f9f9f9', border:'1px solid rgba(0,0,0,0.08)', borderRadius:8 }}>
                  <div style={{ fontSize:'2.4rem', marginBottom:'0.6rem' }}>{f.icon}</div>
                  <div style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:'1.5rem', marginBottom:'0.4rem' }}>{f.title}</div>
                  <div style={{ fontSize:'1.35rem', color:'#666' }}>{f.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="avvo-footer">
        <div className="avvo-footer-grid">
          <div className="avvo-footer-brand">
            <div className="avvo-footer-logo">⚖ LEX-RATING</div>
            <p className="avvo-footer-tagline">Ethiopia's official B2G legal directory. Find MoJ-verified advocates with real-time ELO performance ratings.</p>
          </div>
          <div className="avvo-footer-col">
            <h4>Find a Lawyer</h4>
            <ul>
              {['Criminal Law','Corporate Law','Family Law','Civil Law'].map(s => (
                <li key={s}><a onClick={() => { setSearchSpec(s.replace(' Law','')); fetchLawyers(s.replace(' Law',''),''); setPage('directory'); }}>{s}</a></li>
              ))}
            </ul>
          </div>
          <div className="avvo-footer-col">
            <h4>Legal Topics</h4>
            <ul>
              {GUIDES_DATA.slice(0,4).map(g => <li key={g.title}><a onClick={() => setPage('guides')}>{g.cat}</a></li>)}
            </ul>
          </div>
          <div className="avvo-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a onClick={() => setPage('about')}>About LEX-RATING</a></li>
              <li><a onClick={() => setPage('directory')}>Lawyer Directory</a></li>
              <li><a onClick={() => setPage('qa')}>Legal Q&A</a></li>
              <li><a onClick={() => setShowAuth(true)}>For Lawyers</a></li>
            </ul>
          </div>
        </div>
        <div className="avvo-footer-bottom">
          <span>© 2026 Ministry of Justice · Court Automation Department · Federal Democratic Republic of Ethiopia</span>
          <span>Privacy Policy · Terms of Use · Federal Registry</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Lawyer Card Component ────────────────────────────────────────────────────
function LawyerCardComponent({ lawyer, onClick }) {
  const avvoRating = eloToRating(lawyer.elo);
  const ratingClass = ratingColor(avvoRating);
  return (
    <div className="lawyer-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
      aria-label={`View profile of ${lawyer.name}`}
    >
      <div className="lawyer-card-inner">
        <div className="lawyer-card-photo-wrap">
          <img
            src={lawyer.profilePic}
            alt={lawyer.name}
            className="lawyer-card-photo"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'; }}
          />
          <div className={`avvo-rating-badge ${ratingClass}`}>{avvoRating}</div>
        </div>
        <div className="lawyer-card-body">
          <div className="lawyer-card-name">{lawyer.name}</div>
          <div className="lawyer-card-spec">{lawyer.specialization}</div>
          <div className="lawyer-card-location">📍 {lawyer.city || 'Addis Ababa'}</div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <StarRow rating={lawyer.rating} />
            <span style={{ fontSize:'1.2rem', color:'#777' }}>{lawyer.rating.toFixed(1)}</span>
          </div>
          <div className="lawyer-card-meta">
            <span>{lawyer.casesCount} cases</span>
            {lawyer.yearsExperience > 0 && <span>{lawyer.yearsExperience} yrs</span>}
            <span className="lawyer-card-free">✓ MoJ Verified</span>
          </div>
        </div>
      </div>
      <div className="lawyer-card-footer">
        <span className="lawyer-card-elo">ELO {lawyer.elo}</span>
        <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); onClick(); }}>View Profile</button>
      </div>
    </div>
  );
}
