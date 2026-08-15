import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

// ── Static mock data for UI scaffolding ──────────────────────────────────────
const MOCK_APPOINTMENTS = [
  { id: 'a1', urgency: 'today',  day: '15', mon: 'Aug', time: '09:30 AM', caseId: 'CASE-2026-004', caseTitle: 'Apex Construction vs. Dubai Real Estate', court: 'Federal Civil Court – Chamber 3', judge: 'Hon. Judge Al Nahyan' },
  { id: 'a2', urgency: 'soon',   day: '18', mon: 'Aug', time: '02:00 PM', caseId: 'CASE-2026-005', caseTitle: 'State Commercial Contract Appeal', court: 'High Court of Appeals – Chamber 1', judge: 'Hon. Judge Al Maktoum' },
  { id: 'a3', urgency: 'normal', day: '24', mon: 'Aug', time: '11:00 AM', caseId: 'CASE-2026-006', caseTitle: 'Al Nahyan Family Arbitration', court: 'Family Affairs Court – Chamber 5', judge: 'Hon. Judge Hassan' },
];

const MOCK_CASES = [
  { caseId: 'CASE-2026-001', caseTitle: 'Federal Prosecutor vs. Al Hashimi Trading', caseType: 'Criminal', status: 'Closed', verdict: 'Plaintiff', judgeName: 'Hon. Judge Al Maktoum', dateDecided: '2026-01-10', sessions: 4 },
  { caseId: 'CASE-2026-002', caseTitle: 'Gulf Tech Corp vs. Emirates Logistics',      caseType: 'Corporate', status: 'Closed', verdict: 'Plaintiff', judgeName: 'Hon. Judge Al Nahyan', dateDecided: '2026-01-22', sessions: 3 },
  { caseId: 'CASE-2026-003', caseTitle: 'Al Mansoori Estate Probate',                 caseType: 'Family',   status: 'Closed', verdict: 'Plaintiff', judgeName: 'Hon. Judge Al Maktoum', dateDecided: '2026-02-04', sessions: 2 },
  { caseId: 'CASE-2026-004', caseTitle: 'Apex Construction vs. Dubai Real Estate',    caseType: 'Civil',    status: 'Active', verdict: null,        judgeName: 'Hon. Judge Al Nahyan', dateDecided: null, sessions: 2 },
  { caseId: 'CASE-2026-005', caseTitle: 'State Commercial Contract Appeal',           caseType: 'Corporate', status: 'Active', verdict: null,       judgeName: 'Hon. Judge Al Maktoum', dateDecided: null, sessions: 1 },
  { caseId: 'CASE-TEST-001', caseTitle: 'High Court Criminal Appeal',                 caseType: 'Criminal', status: 'Closed', verdict: 'Plaintiff', judgeName: 'Hon. Judge Al Maktoum', dateDecided: '2026-03-01', sessions: 5 },
  { caseId: 'CASE-TEST-002', caseTitle: 'Corporate Compliance Hearing',               caseType: 'Corporate', status: 'Closed', verdict: 'Defendant', judgeName: 'Hon. Judge Al Nahyan', dateDecided: '2026-03-10', sessions: 3 },
];

const MOCK_SESSIONS = [
  { date: '2026-01-05', title: 'Initial Hearing', status: 'closed',   verdict: null,  note: 'Case admitted. Both parties submitted initial briefs. Next session scheduled for evidence review.' },
  { date: '2026-01-12', title: 'Evidence Review', status: 'closed',   verdict: null,  note: 'Prosecution presented digital records. Defence objected to exhibit 3C. Objection overruled.' },
  { date: '2026-01-20', title: 'Witness Testimony', status: 'closed', verdict: null,  note: 'Three witnesses examined. Cross-examination concluded. Closing arguments scheduled.' },
  { date: '2026-01-28', title: 'Closing Arguments', status: 'closed', verdict: 'In favour of the Plaintiff. The court finds the defendant liable under Article 247 of the Commercial Code. Penalty of AED 850,000 and compliance order issued.', note: null },
  { date: '2026-08-18', title: 'Session 5 – Upcoming', status: 'upcoming', verdict: null, note: 'Scheduled for further deliberation on penalty appeal.' },
];

const MOCK_UPLOADED_DOCS = [
  { name: 'Evidence_Exhibit_A.pdf', size: '2.4 MB', date: '2026-08-10', encrypted: true },
  { name: 'Client_Statement.pdf',   size: '840 KB', date: '2026-08-12', encrypted: true },
];

const MOCK_PENDING_RATINGS = [
  { caseId: 'CASE-2026-002', caseTitle: 'Gulf Tech Corp vs. Emirates Logistics', lawyerName: 'Sarah Jones', side: 'Plaintiff', licenseNumber: 'LAW-1002', verdict: 'Plaintiff' },
  { caseId: 'CASE-TEST-002', caseTitle: 'Corporate Compliance Hearing',          lawyerName: 'Fatima Al Mansoori', side: 'Defendant', licenseNumber: 'LAW-1004', verdict: 'Defendant' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

function CaseTypeBadge({ type }) {
  return <span className={`case-type-tag case-type-${type}`}>{type}</span>;
}

function StatusBadge({ status, verdict }) {
  if (status === 'Active') return <span className="badge badge-gold"><span className="badge-dot" />Active</span>;
  if (verdict === 'Plaintiff')  return <span className="badge badge-green"><span className="badge-dot" />Won</span>;
  if (verdict === 'Defendant')  return <span className="badge badge-clay"><span className="badge-dot" />Lost</span>;
  return <span className="badge badge-gray">{status}</span>;
}

// ─── Lawyer Card ─────────────────────────────────────────────────────────────
function LawyerCard({ lawyer }) {
  return (
    <article className="lawyer-card animate-fade-up">
      <img
        src={lawyer.profilePic}
        alt={lawyer.name}
        className="lawyer-card-avatar"
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'; }}
      />
      <div className="lawyer-card-body">
        <h3 className="lawyer-card-name">{lawyer.name}</h3>
        <span className="lawyer-card-spec">{lawyer.specialization}</span>
        <div className="lawyer-card-stats">
          <StarRow rating={lawyer.rating} />
          <span className="lawyer-card-rating">{lawyer.rating.toFixed(1)}</span>
          <span className="lawyer-card-cases">{lawyer.casesCount} {lawyer.casesCount === 1 ? 'case' : 'cases'}</span>
          <span className="lawyer-card-elo">{lawyer.elo} ELO</span>
        </div>
      </div>
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
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm]     = useState({ name:'', username:'', password:'', email:'', role:'client', licenseNumber:'', specialization:'Criminal' });
  const [otpEmail, setOtpEmail]   = useState('');
  const [otpCode, setOtpCode]     = useState('');
  const clear = () => { setError(''); setSuccess(''); };

  const handleLogin = async e => {
    e.preventDefault(); clear(); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(loginForm) });
      const data = await res.json();
      if (res.ok) { setSuccess(`Welcome back, ${data.user.name}!`); setTimeout(() => { onLogin(data.user); onClose(); }, 800); }
      else setError(data.error || 'Login failed.');
    } catch { setError('Cannot reach server on port 5000.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async e => {
    e.preventDefault(); clear(); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(regForm) });
      const data = await res.json();
      if (res.ok) { setOtpEmail(regForm.email); setStep('otp'); setSuccess('Verification code sent to your email.'); }
      else setError(data.error || 'Registration failed.');
    } catch { setError('Cannot reach server on port 5000.'); }
    finally { setLoading(false); }
  };

  const handleVerify = async e => {
    e.preventDefault(); clear(); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register-verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:otpEmail, code:otpCode }) });
      const data = await res.json();
      if (res.ok) { setSuccess('Account verified! Please sign in.'); setTimeout(() => { setTab('login'); setStep('form'); clear(); }, 1200); }
      else setError(data.error || 'Invalid or expired code.');
    } catch { setError('Cannot reach server.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal animate-fade-up" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="modal-title">
              {step==='otp' ? 'Verify your email' : tab==='login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="modal-subtitle">
              {step==='otp' ? `Code sent to ${otpEmail}` : tab==='login' ? 'Sign in to your LEX-RATING account' : 'Register with your verified credentials'}
            </p>
          </div>
          <button className="modal-close focus-ring" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {step==='form' && (
            <div className="modal-tabs" role="tablist">
              <button role="tab" aria-selected={tab==='login'}    className={`modal-tab${tab==='login'    ? ' active':''}`} onClick={() => { setTab('login');    clear(); }}>Sign In</button>
              <button role="tab" aria-selected={tab==='register'} className={`modal-tab${tab==='register' ? ' active':''}`} onClick={() => { setTab('register'); clear(); }}>Register</button>
            </div>
          )}
          {error   && <div className="alert alert-error"   role="alert">  <span>⚠</span><span>{error}</span></div>}
          {success && <div className="alert alert-success" role="status"><span>✓</span><span>{success}</span></div>}

          {step==='otp' && (
            <form onSubmit={handleVerify} noValidate>
              <div className="form-group">
                <label htmlFor="otp-code" className="form-label">6-Digit Verification Code</label>
                <input id="otp-code" type="text" inputMode="numeric" maxLength={6} className="form-input otp-input focus-ring" placeholder="• • • • • •" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g,''))} required autoFocus />
                <p className="form-helper">Check your inbox and spam folder. Expires in 10 minutes.</p>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || otpCode.length!==6}>{loading ? <span className="loading-spinner"/> : 'Verify & Complete Registration'}</button>
              <button type="button" className="btn btn-ghost btn-full" style={{marginTop:'.5rem'}} onClick={() => { setStep('form'); setOtpCode(''); clear(); }}>← Back</button>
            </form>
          )}

          {step==='form' && tab==='login' && (
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label htmlFor="login-user" className="form-label">Username or Email</label>
                <input id="login-user" type="text" autoComplete="username" className="form-input focus-ring" placeholder="Enter your username or email" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username:e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label htmlFor="login-pass" className="form-label">Password</label>
                <input id="login-pass" type="password" autoComplete="current-password" className="form-input focus-ring" placeholder="Enter your password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password:e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" style={{marginTop:'.5rem'}} disabled={loading}>{loading ? <span className="loading-spinner"/> : 'Sign In'}</button>
            </form>
          )}

          {step==='form' && tab==='register' && (
            <form onSubmit={handleRegister} noValidate>
              <div className="form-group"><label htmlFor="reg-name" className="form-label">Full Name</label><input id="reg-name" type="text" autoComplete="name" className="form-input focus-ring" placeholder="e.g. John Smith" value={regForm.name} onChange={e => setRegForm({...regForm,name:e.target.value})} required autoFocus/></div>
              <div className="form-group"><label htmlFor="reg-email" className="form-label">Email Address</label><input id="reg-email" type="email" autoComplete="email" className="form-input focus-ring" placeholder="yourname@example.com" value={regForm.email} onChange={e => setRegForm({...regForm,email:e.target.value})} required/></div>
              <div className="form-group"><label htmlFor="reg-username" className="form-label">Username</label><input id="reg-username" type="text" autoComplete="username" className="form-input focus-ring" placeholder="Choose a username" value={regForm.username} onChange={e => setRegForm({...regForm,username:e.target.value})} required/></div>
              <div className="form-group"><label htmlFor="reg-password" className="form-label">Password</label><input id="reg-password" type="password" autoComplete="new-password" className="form-input focus-ring" placeholder="Create a secure password" value={regForm.password} onChange={e => setRegForm({...regForm,password:e.target.value})} required/></div>
              <div className="form-group">
                <label htmlFor="reg-role" className="form-label">Account Type</label>
                <select id="reg-role" className="form-select focus-ring" value={regForm.role} onChange={e => setRegForm({...regForm,role:e.target.value})}>
                  <option value="client">Client (Litigant)</option>
                  <option value="lawyer">Advocate (Lawyer)</option>
                </select>
              </div>
              {regForm.role==='lawyer' && (
                <div className="license-box">
                  <div className="license-box-title"><span>🔒</span> MoJ License Verification Required</div>
                  <div className="form-group"><label htmlFor="reg-license" className="form-label">License Number</label><input id="reg-license" type="text" className="form-input focus-ring" placeholder="e.g. LAW-1001" value={regForm.licenseNumber} onChange={e => setRegForm({...regForm,licenseNumber:e.target.value})} required/><p className="form-helper">Your full name must exactly match the name on the MoJ registry.</p></div>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label htmlFor="reg-spec" className="form-label">Specialization</label>
                    <select id="reg-spec" className="form-select focus-ring" value={regForm.specialization} onChange={e => setRegForm({...regForm,specialization:e.target.value})}>
                      <option value="Criminal">Criminal</option><option value="Corporate">Corporate</option><option value="Family">Family</option><option value="Civil">Civil</option>
                    </select>
                  </div>
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-full btn-lg" style={{marginTop:'.75rem'}} disabled={loading}>{loading ? <span className="loading-spinner"/> : 'Create Account & Send OTP'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page: Home ───────────────────────────────────────────────────────────────
function HomePage({ user, onShowAuth }) {
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeSpec, setActiveSpec]     = useState('');
  const [lawyers, setLawyers]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const SPECS = ['Criminal', 'Corporate', 'Family', 'Civil'];

  const fetchLawyers = useCallback(async (spec = '') => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/lawyers/search?specialization=${encodeURIComponent(spec)}`);
      const data = await res.json();
      if (Array.isArray(data)) setLawyers(data);
    } catch { setLawyers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLawyers(''); }, [fetchLawyers]);

  const handleSearch = e => {
    const v = e.target.value; setSearchQuery(v); setActiveSpec(''); fetchLawyers(v);
  };
  const handleSpec = spec => {
    if (activeSpec===spec) { setActiveSpec(''); setSearchQuery(''); fetchLawyers(''); }
    else { setActiveSpec(spec); setSearchQuery(''); fetchLawyers(spec); }
  };

  return (
    <>
      {/* Hero */}
      <section className="hero texture-grain" aria-labelledby="hero-heading">
        <div className="hero-glow-1" aria-hidden="true"/>
        <div className="hero-glow-2" aria-hidden="true"/>
        <div className="hero-inner">
          <div className="hero-badge"><span className="hero-badge-dot" aria-hidden="true"/>Official Ministry of Justice Registry</div>
          <h1 className="hero-title" id="hero-heading">
            Find a <span className="hero-title-accent">verified</span><br/>legal advocate
          </h1>
          <p className="hero-subtitle">
            Search registered lawyers by specialization, compare real-time ELO performance ratings, and connect with the right advocate for your case.
          </p>
          <div className="hero-actions">
            <button className="btn btn-gold btn-lg focus-ring" onClick={() => document.getElementById('lawyer-directory')?.scrollIntoView({behavior:'smooth'})}>Browse Advocates</button>
            {!user && <button className="btn btn-ghost btn-lg focus-ring" style={{color:'rgba(245,239,226,.8)',border:'1px solid rgba(245,239,226,.2)'}} onClick={onShowAuth}>Register Account</button>}
          </div>
          <div className="hero-stats" role="list">
            <div className="hero-stat" role="listitem"><div className="hero-stat-value">{lawyers.length}+</div><div className="hero-stat-label">Verified Advocates</div></div>
            <div className="hero-stat" role="listitem"><div className="hero-stat-value">{SPECS.length}</div><div className="hero-stat-label">Specializations</div></div>
            <div className="hero-stat" role="listitem"><div className="hero-stat-value">ELO</div><div className="hero-stat-label">Live Ratings</div></div>
          </div>
        </div>
      </section>

      {/* Directory */}
      <main className="main-content" id="lawyer-directory">
        <section className="search-section" aria-label="Search lawyers">
          <div className="search-header">
            <h2 className="search-title">Search Legal Advocates</h2>
            <p className="search-subtitle">Filter by specialization or search to find verified professionals.</p>
          </div>
          <div className="search-bar" role="search">
            <span className="search-bar-icon" aria-hidden="true">🔍</span>
            <input id="search-advocates" type="search" className="search-input focus-ring" placeholder="Search by specialization (Criminal, Corporate, Family, Civil)…" value={searchQuery} onChange={handleSearch} aria-label="Search legal advocates"/>
          </div>
          <div className="spec-filters" role="group" aria-label="Filter by specialization">
            {SPECS.map(s => (
              <button key={s} className={`spec-chip focus-ring${activeSpec===s?' active':''}`} onClick={() => handleSpec(s)} aria-pressed={activeSpec===s}>{s}</button>
            ))}
          </div>
        </section>

        <section className="lawyers-section" aria-label="Results">
          <div className="lawyers-header">
            <h2 className="lawyers-count"><span>{lawyers.length}</span> {lawyers.length===1?'Advocate':'Advocates'} Found</h2>
            {(searchQuery||activeSpec) && <button className="btn btn-ghost btn-sm focus-ring" onClick={() => { setSearchQuery(''); setActiveSpec(''); fetchLawyers(''); }}>Clear ✕</button>}
          </div>
          {loading ? (
            <div className="loading-overlay" role="status"><span className="loading-spinner"/><span>Loading advocates…</span></div>
          ) : lawyers.length > 0 ? (
            <div className="lawyers-grid" role="list">
              {lawyers.map(l => <div key={l.id} role="listitem"><LawyerCard lawyer={l}/></div>)}
            </div>
          ) : (
            <div className="empty-state" role="status">
              <div className="empty-state-icon" aria-hidden="true">⚖</div>
              <p className="empty-state-text">No verified advocates found</p>
              <p className="empty-state-sub">{searchQuery ? `No results for "${searchQuery}". Try a different specialization.` : 'No lawyers registered yet.'}</p>
              {!user && <button className="btn btn-primary" style={{marginTop:'1.5rem'}} onClick={onShowAuth}>Register as an Advocate</button>}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

// ─── Page: Cases ──────────────────────────────────────────────────────────────
function CasesPage({ onSelectCase }) {
  const [filter, setFilter] = useState('all'); // all | active | closed

  const filtered = filter === 'all' ? MOCK_CASES
    : MOCK_CASES.filter(c => (filter === 'active' ? c.status === 'Active' : c.status === 'Closed'));

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-glow" aria-hidden="true"/>
        <div className="page-hero-inner">
          <div className="page-hero-row">
            <div>
              <p className="page-hero-eyebrow">⚖ Judicial Court System</p>
              <h1 className="page-hero-title">Court Case Registry</h1>
              <p className="page-hero-subtitle">All cases assigned through the Ministry of Justice scheduling system.</p>
            </div>
            <button className="btn btn-gold btn-sm focus-ring" disabled style={{opacity:.5}}>
              + New Case (Admin only)
            </button>
          </div>
        </div>
      </div>

      <main className="main-content">
        <div className="page-section">
          {/* Filter tabs */}
          <div style={{display:'flex', gap:'.5rem', marginBottom:'1.5rem', borderBottom:'1px solid var(--color-line)', paddingBottom:'1rem'}}>
            {['all','active','closed'].map(f => (
              <button key={f} className={`btn btn-sm focus-ring${filter===f?' btn-primary':' btn-ghost'}`} onClick={() => setFilter(f)} style={{textTransform:'capitalize'}}>
                {f==='all'?'All Cases':f==='active'?'Active':'Closed'}&nbsp;
                <span style={{opacity:.7, fontSize:'.75rem'}}>
                  ({f==='all'?MOCK_CASES.length:f==='active'?MOCK_CASES.filter(c=>c.status==='Active').length:MOCK_CASES.filter(c=>c.status==='Closed').length})
                </span>
              </button>
            ))}
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">
                {filter==='all'?'All Cases':filter==='active'?'Active Cases':'Closed Cases'}
                <span style={{fontFamily:'var(--font-mono)', fontSize:'.8125rem', fontWeight:400, color:'var(--color-ink-700)', opacity:.6, marginLeft:'.75rem'}}>{filtered.length} records</span>
              </h2>
            </div>
            <div style={{overflowX:'auto'}}>
              <table className="case-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Judge</th>
                    <th>Sessions</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.caseId}>
                      <td><span className="case-id">{c.caseId}</span></td>
                      <td><span className="case-title-cell">{c.caseTitle}</span></td>
                      <td><CaseTypeBadge type={c.caseType}/></td>
                      <td><StatusBadge status={c.status} verdict={c.verdict}/></td>
                      <td style={{fontSize:'.875rem', color:'var(--color-ink-700)'}}>{c.judgeName}</td>
                      <td style={{fontFamily:'var(--font-mono)', fontSize:'.8125rem', textAlign:'center'}}>{c.sessions}</td>
                      <td style={{fontFamily:'var(--font-mono)', fontSize:'.8125rem', color:'var(--color-ink-700)', opacity:.6}}>{c.dateDecided || '—'}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm focus-ring" onClick={() => onSelectCase(c)} style={{fontSize:'.8125rem'}}>
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Page: Case Detail ────────────────────────────────────────────────────────
function CaseDetailPage({ caseData, onBack }) {
  const [judgeRatings, setJudgeRatings] = useState({});
  const [ratingSubmitted, setRatingSubmitted] = useState({});

  const setRating = (id, val) => setJudgeRatings(prev => ({...prev, [id]: val}));

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-glow" aria-hidden="true"/>
        <div className="page-hero-inner">
          <div style={{marginBottom:'.75rem'}}>
            <button className="btn btn-ghost btn-sm focus-ring" style={{color:'rgba(245,239,226,.6)', border:'1px solid rgba(245,239,226,.15)'}} onClick={onBack}>
              ← Back to Cases
            </button>
          </div>
          <div className="page-hero-row">
            <div>
              <p className="page-hero-eyebrow">
                <span className="case-id" style={{color:'rgba(245,239,226,.45)'}}>{caseData.caseId}</span>&nbsp;·&nbsp;
                <CaseTypeBadge type={caseData.caseType}/>
              </p>
              <h1 className="page-hero-title" style={{marginTop:'.5rem'}}>{caseData.caseTitle}</h1>
              <p className="page-hero-subtitle">{caseData.judgeName}</p>
            </div>
            <StatusBadge status={caseData.status} verdict={caseData.verdict}/>
          </div>
        </div>
      </div>

      <main className="main-content">
        <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'1.5rem', padding:'2rem 0 4rem'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'1.5rem'}}>
            {/* Session Timeline */}
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">📋 Session Timeline</h2>
                <span className="badge badge-gray">{MOCK_SESSIONS.length} sessions</span>
              </div>
              <div className="panel-body">
                <div className="timeline">
                  {MOCK_SESSIONS.map((s, i) => (
                    <div key={i} className="timeline-item">
                      <div className={`timeline-dot ${s.status}`}>{s.status==='closed'?'✓':s.status==='active'?'●':'○'}</div>
                      <div className="timeline-content">
                        <div className="timeline-date">{s.date}</div>
                        <div className="timeline-title">{s.title}</div>
                        {s.note && <div className="timeline-text">{s.note}</div>}
                        {s.verdict && (
                          <div className="timeline-verdict-box">
                            <div className="timeline-verdict-label">⚖ Judge's Final Statement</div>
                            <div className="timeline-verdict-text">{s.verdict}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Judge Rating Panel — only for closed cases */}
            {caseData.status === 'Closed' && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">⭐ Rate Lawyer Performance</h2>
                  <span className="badge badge-gold">Judge Only</span>
                </div>
                <div className="panel-body-padded">
                  <div className="alert alert-info" style={{marginBottom:'1.25rem'}}>
                    <span>ℹ</span>
                    <span>These ratings update the lawyer's ELO score in the live directory. Rate based on professionalism, preparation, and legal acumen.</span>
                  </div>
                  {MOCK_PENDING_RATINGS.map(r => (
                    <div key={r.caseId + r.side} style={{padding:'1.25rem', background:'var(--color-cream-50)', border:'1px solid var(--color-line)', borderRadius:'var(--radius-lg)', marginBottom:'1rem'}}>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.75rem', flexWrap:'wrap', gap:'.5rem'}}>
                        <div>
                          <div style={{fontWeight:600, color:'var(--color-ink-950)'}}>{r.lawyerName}</div>
                          <div style={{fontSize:'.8125rem', color:'var(--color-ink-700)', opacity:.65}}>{r.side} Counsel · <span className="font-mono">{r.licenseNumber}</span></div>
                        </div>
                        <span className={`badge ${r.verdict === r.side ? 'badge-green' : 'badge-clay'}`}>
                          {r.verdict === r.side ? 'Won' : 'Lost'}
                        </span>
                      </div>
                      {ratingSubmitted[r.licenseNumber] ? (
                        <div className="alert alert-success" style={{marginBottom:0}}>
                          <span>✓</span><span>Rating submitted: {judgeRatings[r.licenseNumber]} / 5 stars</span>
                        </div>
                      ) : (
                        <>
                          <div className="form-label" style={{marginBottom:'.25rem'}}>Performance Rating</div>
                          <div className="rating-stars-input" role="group" aria-label={`Rate ${r.lawyerName}`}>
                            {[1,2,3,4,5].map(v => (
                              <button
                                key={v}
                                className={`rating-star-btn${judgeRatings[r.licenseNumber] >= v ? ' selected' : ''}`}
                                onClick={() => setRating(r.licenseNumber, v)}
                                aria-label={`${v} star${v>1?'s':''}`}
                              >★</button>
                            ))}
                            {judgeRatings[r.licenseNumber] && (
                              <span style={{alignSelf:'center', fontFamily:'var(--font-mono)', fontSize:'.875rem', color:'var(--color-gold-500)', marginLeft:'.5rem', fontWeight:600}}>
                                {judgeRatings[r.licenseNumber]}.0
                              </span>
                            )}
                          </div>
                          <button
                            className="btn btn-primary btn-sm focus-ring"
                            style={{marginTop:'.75rem'}}
                            disabled={!judgeRatings[r.licenseNumber]}
                            onClick={() => setRatingSubmitted(prev => ({...prev, [r.licenseNumber]: true}))}
                          >
                            Submit Rating
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Document Submission */}
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">📎 Encrypted Document Vault</h2>
                <span className="badge badge-green">🔒 AES-256</span>
              </div>
              <div className="panel-body-padded">
                <div className="alert alert-info" style={{marginBottom:'1.25rem'}}>
                  <span>🔒</span>
                  <span>All documents are encrypted before upload. Only authorized parties (assigned lawyers, judge, admin) can decrypt and view submissions.</span>
                </div>

                {/* Upload dropzone */}
                <div
                  className="upload-zone"
                  role="button"
                  tabIndex={0}
                  aria-label="Upload PDF documents"
                >
                  <div className="upload-zone-icon" aria-hidden="true">📄</div>
                  <div className="upload-zone-title">Drop PDF files here</div>
                  <div className="upload-zone-sub">or click to browse your device</div>
                  <div className="upload-zone-limit">PDF only · Max 25 MB per file</div>
                </div>

                {/* Existing uploaded files */}
                {MOCK_UPLOADED_DOCS.length > 0 && (
                  <div className="upload-file-list" role="list" aria-label="Uploaded documents">
                    {MOCK_UPLOADED_DOCS.map((doc, i) => (
                      <div key={i} className="upload-file-item" role="listitem">
                        <span className="upload-file-icon" aria-hidden="true">📄</span>
                        <div className="upload-file-info">
                          <div className="upload-file-name">{doc.name}</div>
                          <div className="upload-file-meta">{doc.size} · Uploaded {doc.date}</div>
                        </div>
                        {doc.encrypted && <span className="upload-file-enc">🔒 Encrypted</span>}
                        <button className="btn btn-ghost btn-sm focus-ring" style={{flexShrink:0}}>↓ Download</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Page: Dashboard ──────────────────────────────────────────────────────────
function DashboardPage({ user }) {
  const [dashTab, setDashTab] = useState('overview');
  const role = user?.role || 'client';

  const lawyerNav = [
    { id:'overview',     icon:'🏠', label:'Overview' },
    { id:'appointments', icon:'📅', label:'Appointments', count: MOCK_APPOINTMENTS.length },
    { id:'my-cases',     icon:'⚖',  label:'My Cases',     count: MOCK_CASES.filter(c=>c.status==='Active').length },
    { id:'documents',    icon:'📎', label:'Documents' },
    { id:'my-ratings',   icon:'⭐', label:'My Ratings' },
  ];

  const judgeNav = [
    { id:'overview',    icon:'🏠', label:'Overview' },
    { id:'docket',      icon:'📋', label:'Court Docket', count: MOCK_CASES.filter(c=>c.status==='Active').length },
    { id:'rate-lawyers',icon:'⭐', label:'Rate Lawyers',  count: MOCK_PENDING_RATINGS.length },
    { id:'closed',      icon:'✅', label:'Closed Cases' },
  ];

  const adminNav = [
    { id:'overview',   icon:'🏠', label:'Overview' },
    { id:'schedule',   icon:'📅', label:'Schedule Cases' },
    { id:'all-cases',  icon:'⚖',  label:'All Cases', count: MOCK_CASES.length },
    { id:'lawyers',    icon:'👤', label:'Registered Lawyers' },
  ];

  const navItems = role === 'judge' ? judgeNav : role === 'admin' ? adminNav : lawyerNav;

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-glow" aria-hidden="true"/>
        <div className="page-hero-inner">
          <div className="page-hero-row">
            <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
              <img
                src={user?.profilePic || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'}
                alt={user?.name}
                style={{width:'3.5rem', height:'3.5rem', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(200,147,42,.4)', flexShrink:0}}
                onError={e => { e.target.src='https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'; }}
              />
              <div>
                <p className="page-hero-eyebrow">
                  {role==='judge' ? '⚖ Judicial Dashboard' : role==='admin' ? '🛡 Administration' : '👤 Lawyer Portal'}
                </p>
                <h1 className="page-hero-title">{user?.name || 'Dashboard'}</h1>
                <p className="page-hero-subtitle" style={{textTransform:'capitalize'}}>{role} account · {user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="main-content">
        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dash-sidebar" aria-label="Dashboard navigation">
            <div className="dash-sidebar-section">Navigation</div>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`dash-nav-item focus-ring${dashTab===item.id ? ' active' : ''}`}
                onClick={() => setDashTab(item.id)}
                aria-current={dashTab===item.id ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.count != null && <span className="nav-count">{item.count}</span>}
              </button>
            ))}
          </aside>

          {/* Main */}
          <div className="dash-main">

            {/* ── OVERVIEW ── */}
            {dashTab === 'overview' && (
              <>
                <div className="stat-cards">
                  {role !== 'judge' && role !== 'admin' ? (
                    <>
                      <div className="panel stat-card"><div className="stat-card-stripe green"/><div className="stat-card-icon">⚖</div><div className="stat-card-value">{MOCK_CASES.length}</div><div className="stat-card-label">Total Cases</div></div>
                      <div className="panel stat-card"><div className="stat-card-stripe gold"/><div className="stat-card-icon">📅</div><div className="stat-card-value">{MOCK_APPOINTMENTS.length}</div><div className="stat-card-label">Upcoming Sessions</div></div>
                      <div className="panel stat-card"><div className="stat-card-stripe green"/><div className="stat-card-icon">✅</div><div className="stat-card-value">{MOCK_CASES.filter(c=>c.verdict==='Plaintiff'||c.verdict==='Defendant').length}</div><div className="stat-card-label">Cases Won</div></div>
                      <div className="panel stat-card"><div className="stat-card-stripe ink"/><div className="stat-card-icon">⭐</div><div className="stat-card-value">4.7</div><div className="stat-card-label">Avg Rating</div></div>
                    </>
                  ) : role === 'judge' ? (
                    <>
                      <div className="panel stat-card"><div className="stat-card-stripe green"/><div className="stat-card-icon">📋</div><div className="stat-card-value">{MOCK_CASES.filter(c=>c.status==='Active').length}</div><div className="stat-card-label">Active Cases</div></div>
                      <div className="panel stat-card"><div className="stat-card-stripe gold"/><div className="stat-card-icon">⭐</div><div className="stat-card-value">{MOCK_PENDING_RATINGS.length}</div><div className="stat-card-label">Ratings Pending</div></div>
                      <div className="panel stat-card"><div className="stat-card-stripe clay"/><div className="stat-card-icon">✅</div><div className="stat-card-value">{MOCK_CASES.filter(c=>c.status==='Closed').length}</div><div className="stat-card-label">Cases Decided</div></div>
                      <div className="panel stat-card"><div className="stat-card-stripe ink"/><div className="stat-card-icon">📅</div><div className="stat-card-value">{MOCK_APPOINTMENTS.length}</div><div className="stat-card-label">Sessions This Week</div></div>
                    </>
                  ) : (
                    <>
                      <div className="panel stat-card"><div className="stat-card-stripe green"/><div className="stat-card-icon">⚖</div><div className="stat-card-value">{MOCK_CASES.length}</div><div className="stat-card-label">Total Cases</div></div>
                      <div className="panel stat-card"><div className="stat-card-stripe gold"/><div className="stat-card-icon">👤</div><div className="stat-card-value">6</div><div className="stat-card-label">Registered Lawyers</div></div>
                      <div className="panel stat-card"><div className="stat-card-stripe green"/><div className="stat-card-icon">📅</div><div className="stat-card-value">{MOCK_CASES.filter(c=>c.status==='Active').length}</div><div className="stat-card-label">Active Cases</div></div>
                      <div className="panel stat-card"><div className="stat-card-stripe clay"/><div className="stat-card-icon">✅</div><div className="stat-card-value">{MOCK_CASES.filter(c=>c.status==='Closed').length}</div><div className="stat-card-label">Closed Cases</div></div>
                    </>
                  )}
                </div>

                {/* Upcoming reminders */}
                {role !== 'admin' && (
                  <div className="panel" style={{marginBottom:'1.5rem'}}>
                    <div className="panel-header">
                      <h2 className="panel-title">📅 Upcoming Appointments</h2>
                      <button className="btn btn-ghost btn-sm focus-ring" onClick={() => setDashTab('appointments')}>View all →</button>
                    </div>
                    <div className="panel-body">
                      {MOCK_APPOINTMENTS.slice(0,2).map(a => (
                        <div key={a.id} className={`reminder-card ${a.urgency}`}>
                          <div className={`reminder-card-urgency ${a.urgency}`}>
                            <span className="reminder-day">{a.day}</span>
                            <span className="reminder-mon">{a.mon}</span>
                          </div>
                          <div className="reminder-info">
                            <div className="reminder-case">{a.caseTitle}</div>
                            <div className="reminder-meta">
                              <span>{a.court}</span>
                              <span className="reminder-time">🕐 {a.time}</span>
                            </div>
                          </div>
                          {a.urgency==='today' && <span className="badge badge-clay">TODAY</span>}
                          {a.urgency==='soon'  && <span className="badge badge-gold">SOON</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── APPOINTMENTS ── */}
            {(dashTab === 'appointments' || dashTab === 'docket') && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">{dashTab==='docket' ? '📋 Court Docket' : '📅 Appointment Reminders'}</h2>
                  <span className="badge badge-green">{MOCK_APPOINTMENTS.length} scheduled</span>
                </div>
                <div className="alert alert-info" style={{margin:'1rem 1.5rem 0', borderRadius:'var(--radius-md)'}}>
                  <span>🔔</span>
                  <span>You will receive email reminders 24 hours and 2 hours before each session.</span>
                </div>
                <div className="panel-body">
                  {MOCK_APPOINTMENTS.map(a => (
                    <div key={a.id} className={`reminder-card ${a.urgency}`}>
                      <div className={`reminder-card-urgency ${a.urgency}`}>
                        <span className="reminder-day">{a.day}</span>
                        <span className="reminder-mon">{a.mon}</span>
                      </div>
                      <div className="reminder-info">
                        <div className="reminder-case">{a.caseTitle}</div>
                        <div className="reminder-meta">
                          <span>{a.court}</span>
                          <span>Judge: {a.judge}</span>
                          <span className="reminder-time">🕐 {a.time}</span>
                        </div>
                        <div style={{marginTop:'.375rem'}}><span className="case-id">{a.caseId}</span></div>
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:'.375rem', alignItems:'flex-end', flexShrink:0}}>
                        {a.urgency==='today' && <span className="badge badge-clay">TODAY</span>}
                        {a.urgency==='soon'  && <span className="badge badge-gold">SOON</span>}
                        {a.urgency==='normal'&& <span className="badge badge-gray">Upcoming</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MY CASES / ALL CASES ── */}
            {(dashTab === 'my-cases' || dashTab === 'all-cases' || dashTab === 'closed') && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">{dashTab==='my-cases' ? '⚖ My Cases' : dashTab==='closed' ? '✅ Decided Cases' : '⚖ All Cases'}</h2>
                  <span className="badge badge-gray">{MOCK_CASES.length} records</span>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="case-table">
                    <thead><tr><th>Case ID</th><th>Title</th><th>Type</th><th>Status</th><th>Verdict</th><th>Date</th></tr></thead>
                    <tbody>
                      {MOCK_CASES
                        .filter(c => dashTab==='closed' ? c.status==='Closed' : true)
                        .map(c => (
                        <tr key={c.caseId}>
                          <td><span className="case-id">{c.caseId}</span></td>
                          <td><span className="case-title-cell">{c.caseTitle}</span></td>
                          <td><CaseTypeBadge type={c.caseType}/></td>
                          <td><StatusBadge status={c.status} verdict={c.verdict}/></td>
                          <td>{c.verdict ? <span style={{fontSize:'.875rem', fontWeight:500}}>{c.verdict}</span> : <span style={{opacity:.4}}>—</span>}</td>
                          <td><span className="font-mono" style={{fontSize:'.8125rem', opacity:.6}}>{c.dateDecided||'Ongoing'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── DOCUMENTS ── */}
            {dashTab === 'documents' && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">📎 Encrypted Document Vault</h2>
                  <span className="badge badge-green">🔒 AES-256</span>
                </div>
                <div className="panel-body-padded">
                  <div className="alert alert-info" style={{marginBottom:'1.25rem'}}>
                    <span>🔒</span>
                    <span>All documents are AES-256 encrypted. Only the assigned judge, co-counsel, and admin can access your submissions.</span>
                  </div>
                  <div className="upload-zone" role="button" tabIndex={0} aria-label="Upload PDF">
                    <div className="upload-zone-icon" aria-hidden="true">📄</div>
                    <div className="upload-zone-title">Drop PDF files here to upload</div>
                    <div className="upload-zone-sub">or click to browse your device</div>
                    <div className="upload-zone-limit">PDF only · Max 25 MB per file</div>
                  </div>
                  <div className="upload-file-list" role="list">
                    {MOCK_UPLOADED_DOCS.map((doc, i) => (
                      <div key={i} className="upload-file-item" role="listitem">
                        <span className="upload-file-icon" aria-hidden="true">📄</span>
                        <div className="upload-file-info">
                          <div className="upload-file-name">{doc.name}</div>
                          <div className="upload-file-meta">{doc.size} · {doc.date}</div>
                        </div>
                        {doc.encrypted && <span className="upload-file-enc">🔒 Encrypted</span>}
                        <button className="btn btn-ghost btn-sm focus-ring">↓</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── MY RATINGS ── */}
            {dashTab === 'my-ratings' && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">⭐ My Performance Ratings</h2>
                  <span className="badge badge-gold">ELO Live</span>
                </div>
                <div className="panel-body-padded">
                  <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem'}}>
                    {[{label:'Average Rating', value:'4.7 / 5.0', icon:'⭐'},{label:'ELO Score', value:'1096', icon:'📊'},{label:'Total Reviews', value:'18', icon:'📝'}].map(s => (
                      <div key={s.label} style={{padding:'1rem', background:'var(--color-cream-50)', border:'1px solid var(--color-line)', borderRadius:'var(--radius-lg)', textAlign:'center'}}>
                        <div style={{fontSize:'1.5rem', marginBottom:'.5rem'}}>{s.icon}</div>
                        <div style={{fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:600, color:'var(--color-ink-950)'}}>{s.value}</div>
                        <div style={{fontSize:'.8125rem', color:'var(--color-ink-700)', opacity:.65}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{borderTop:'1px solid var(--color-line)', paddingTop:'1.25rem'}}>
                    <h3 style={{fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, marginBottom:'1rem', color:'var(--color-ink-950)'}}>Recent Case Ratings</h3>
                    {MOCK_CASES.filter(c=>c.status==='Closed').slice(0,4).map(c => (
                      <div key={c.caseId} style={{display:'flex', alignItems:'center', gap:'1rem', padding:'.875rem 0', borderBottom:'1px solid var(--color-line)'}}>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{fontWeight:600, fontSize:'.9375rem', color:'var(--color-ink-900)', marginBottom:'.25rem'}}>{c.caseTitle}</div>
                          <div style={{fontSize:'.8125rem', color:'var(--color-ink-700)', opacity:.65, fontFamily:'var(--font-mono)'}}>{c.caseId} · {c.dateDecided}</div>
                        </div>
                        <StarRow rating={4.5}/>
                        <span style={{fontFamily:'var(--font-mono)', fontSize:'.875rem', fontWeight:600, color:'var(--color-gold-500)', flexShrink:0}}>4.5</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── RATE LAWYERS (Judge) ── */}
            {dashTab === 'rate-lawyers' && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">⭐ Rate Lawyer Performance</h2>
                  <span className="badge badge-gold">{MOCK_PENDING_RATINGS.length} pending</span>
                </div>
                <div className="panel-body-padded">
                  <div className="alert alert-warn" style={{marginBottom:'1.25rem'}}>
                    <span>⚖</span><span>Ratings are permanent and affect lawyer ELO scores in the live directory. Please rate carefully and objectively.</span>
                  </div>
                  {MOCK_PENDING_RATINGS.map(r => (
                    <div key={r.licenseNumber} style={{padding:'1.25rem', background:'var(--color-cream-50)', border:'1px solid var(--color-line)', borderRadius:'var(--radius-lg)', marginBottom:'1rem'}}>
                      <div style={{fontSize:'.75rem', color:'var(--color-ink-700)', opacity:.55, marginBottom:'.375rem', fontFamily:'var(--font-mono)'}}>{r.caseId}</div>
                      <div style={{fontWeight:600, marginBottom:'.125rem'}}>{r.lawyerName}</div>
                      <div style={{fontSize:'.8125rem', color:'var(--color-ink-700)', opacity:.65, marginBottom:'1rem'}}>{r.side} Counsel in <em>{r.caseTitle}</em></div>
                      <div className="form-label" style={{marginBottom:'.25rem'}}>Select Rating</div>
                      <div className="rating-stars-input">
                        {[1,2,3,4,5].map(v => (
                          <button key={v} className="rating-star-btn" aria-label={`${v} star${v>1?'s':''}`}>★</button>
                        ))}
                      </div>
                      <div style={{display:'flex', gap:'.75rem', marginTop:'1rem'}}>
                        <button className="btn btn-primary btn-sm focus-ring">Submit Rating</button>
                        <button className="btn btn-ghost btn-sm focus-ring">Skip</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SCHEDULE (Admin) ── */}
            {dashTab === 'schedule' && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">📅 Schedule New Case</h2>
                  <span className="badge badge-clay">Admin Only</span>
                </div>
                <div className="panel-body-padded">
                  <div className="form-group"><label className="form-label" htmlFor="sch-title">Case Title</label><input id="sch-title" className="form-input focus-ring" placeholder="e.g. Federal Prosecutor vs. XYZ Corp" disabled/></div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                    <div className="form-group"><label className="form-label" htmlFor="sch-type">Case Type</label><select id="sch-type" className="form-select focus-ring" disabled><option>Criminal</option><option>Corporate</option><option>Family</option><option>Civil</option></select></div>
                    <div className="form-group"><label className="form-label" htmlFor="sch-date">Hearing Date</label><input id="sch-date" type="date" className="form-input focus-ring" disabled/></div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                    <div className="form-group"><label className="form-label" htmlFor="sch-p-lawyer">Plaintiff Lawyer (License #)</label><input id="sch-p-lawyer" className="form-input focus-ring" placeholder="e.g. LAW-1001" disabled/></div>
                    <div className="form-group"><label className="form-label" htmlFor="sch-d-lawyer">Defendant Lawyer (License #)</label><input id="sch-d-lawyer" className="form-input focus-ring" placeholder="e.g. LAW-1002" disabled/></div>
                  </div>
                  <div className="form-group"><label className="form-label" htmlFor="sch-judge">Assign Judge</label><select id="sch-judge" className="form-select focus-ring" disabled><option>Hon. Judge Al Maktoum</option><option>Hon. Judge Al Nahyan</option></select></div>
                  <div className="form-group"><label className="form-label" htmlFor="sch-notes">Initial Notes</label><textarea id="sch-notes" className="form-textarea focus-ring" rows={3} placeholder="Preliminary case notes…" disabled/></div>
                  <div className="alert alert-info" style={{marginTop:'.5rem'}}>
                    <span>ℹ</span><span>Case scheduling functionality will be enabled in a future update. This is a UI preview.</span>
                  </div>
                  <button className="btn btn-primary btn-lg focus-ring" disabled style={{marginTop:'1rem', opacity:.5}}>Schedule & Notify Lawyers</button>
                </div>
              </div>
            )}

            {/* ── REGISTERED LAWYERS (Admin) ── */}
            {dashTab === 'lawyers' && (
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">👤 Registered Lawyers</h2>
                  <span className="badge badge-gray">6 records</span>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="case-table">
                    <thead><tr><th>License #</th><th>Full Name</th><th>Specialization</th><th>Status</th><th>Expiry</th></tr></thead>
                    <tbody>
                      {[
                        {lic:'LAW-1001',name:'John Smith',spec:'Criminal',expiry:'2028-05-12'},
                        {lic:'LAW-1002',name:'Sarah Jones',spec:'Corporate',expiry:'2026-09-20'},
                        {lic:'LAW-1003',name:'Michael Davis',spec:'Civil',expiry:'2030-01-15'},
                        {lic:'LAW-1004',name:'Fatima Al Mansoori',spec:'Family',expiry:'2029-03-10'},
                        {lic:'LAW-1005',name:'Zayed Al Nahyan',spec:'Civil',expiry:'2027-11-05'},
                        {lic:'LAW-1006',name:'Amina Al Hashimi',spec:'Corporate',expiry:'2031-07-18'},
                      ].map(l => (
                        <tr key={l.lic}>
                          <td><span className="case-id">{l.lic}</span></td>
                          <td><span className="case-title-cell">{l.name}</span></td>
                          <td><CaseTypeBadge type={l.spec}/></td>
                          <td><span className="badge badge-green"><span className="badge-dot"/>Active</span></td>
                          <td><span className="font-mono" style={{fontSize:'.8125rem', opacity:.6}}>{l.expiry}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Page: About ──────────────────────────────────────────────────────────────
function AboutPage({ onShowAuth, user }) {
  return (
    <>
      <section className="about-section texture-grain" aria-labelledby="about-heading">
        <div className="about-inner">
          <div>
            <div className="about-eyebrow"><span>⚖</span> Official B2G Portal</div>
            <h2 className="about-title" id="about-heading">Transparent, data-driven<br/>legal advocacy</h2>
            <p className="about-text">LEX-RATING is the official government-to-business legal directory, connecting litigants with Ministry of Justice verified legal advocates through real-time ELO performance ratings.</p>
            <p className="about-text">Every lawyer listed holds a verified MoJ license, ensuring accountability and professionalism in every case engagement.</p>
            <div className="about-features" role="list">
              {[
                {icon:'🔒', text:'Ministry of Justice license verification on registration'},
                {icon:'📊', text:'Real-time ELO rating engine — updated after every case'},
                {icon:'⭐', text:'Dual rating system: judge + client performance scores'},
                {icon:'📎', text:'AES-256 encrypted document vault for all case submissions'},
                {icon:'📅', text:'Automated appointment reminders 24h and 2h before sessions'},
                {icon:'📧', text:'Email-verified accounts via OTP authentication'},
              ].map((f,i) => (
                <div key={i} className="about-feature" role="listitem">
                  <div className="about-feature-icon" aria-hidden="true">{f.icon}</div>
                  <span className="about-feature-text">{f.text}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:'2.5rem', display:'flex', gap:'.75rem', flexWrap:'wrap'}}>
              {!user && <button className="btn btn-gold btn-lg focus-ring" onClick={onShowAuth}>Create Account</button>}
            </div>
          </div>
          <div>
            <div className="about-card">
              <h3 className="about-card-title">MoJ Verified Registry<span className="verified-badge">✓ Live</span></h3>
              <MojPreview/>
            </div>
            <div style={{marginTop:'1.25rem', padding:'1rem', background:'rgba(245,239,226,.04)', border:'1px solid rgba(245,239,226,.1)', borderRadius:'var(--radius-md)'}}>
              <p style={{fontSize:'.8125rem', color:'rgba(245,239,226,.5)', fontFamily:'var(--font-mono)', marginBottom:'.5rem'}}>API Endpoints</p>
              {['GET  /api/lawyers/search','POST /api/auth/register','POST /api/auth/login','GET  /api/court/lawyer-rating/:id','POST /api/moj/verify-license','GET  /api/court/cases'].map(ep => (
                <div key={ep} style={{fontFamily:'var(--font-mono)', fontSize:'.75rem', color:'rgba(245,239,226,.6)', padding:'.25rem 0', borderBottom:'1px solid rgba(245,239,226,.06)'}}>{ep}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── MoJ Preview ─────────────────────────────────────────────────────────────
function MojPreview() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => {
    fetch(`${API_BASE}/moj/licenses`).then(r=>r.json()).then(d => { if(Array.isArray(d)) setLicenses(d.slice(0,5)); }).catch(()=>setLicenses([])).finally(()=>setLoading(false));
  }, []);
  if (loading) return <div style={{padding:'1.5rem', textAlign:'center', color:'rgba(245,239,226,.4)', fontSize:'.875rem'}}>Loading registry…</div>;
  if (!licenses.length) return <div style={{padding:'1.5rem', textAlign:'center', color:'rgba(245,239,226,.4)', fontSize:'.875rem'}}>Server offline — start on port 5000.</div>;
  return (
    <div className="moj-list" role="list">
      {licenses.map(l => (
        <div key={l.licenseNumber} className="moj-item" role="listitem">
          <span className="moj-item-badge">{l.licenseNumber}</span>
          <span className="moj-item-name">{l.fullName}</span>
          <span className="moj-item-spec">{l.specialization}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]         = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCase, setSelectedCase] = useState(null);

  const handleSelectCase = c => { setSelectedCase(c); setActiveTab('case-detail'); };
  const handleBackFromCase = () => { setSelectedCase(null); setActiveTab('cases'); };

  const NAV = [
    { id: 'home',      label: 'Directory' },
    { id: 'cases',     label: 'Cases' },
    ...(user ? [{ id: 'dashboard', label: 'Dashboard' }] : []),
    { id: 'about',     label: 'About' },
  ];

  return (
    <div className="app-wrapper">
      {/* Navbar */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          <button className="navbar-logo focus-ring" onClick={() => setActiveTab('home')} aria-label="LEX-RATING home">
            <div className="navbar-logo-icon" aria-hidden="true">⚖</div>
            <div className="navbar-logo-text">
              <span className="navbar-logo-title">LEX-RATING</span>
              <span className="navbar-logo-subtitle">B2G Legal Directory</span>
            </div>
          </button>

          <div className="navbar-nav" role="menubar">
            {NAV.map(item => (
              <button
                key={item.id}
                role="menuitem"
                className={`navbar-nav-link focus-ring${activeTab === item.id || (activeTab==='case-detail' && item.id==='cases') ? ' active' : ''}`}
                onClick={() => { setActiveTab(item.id); setSelectedCase(null); }}
              >{item.label}</button>
            ))}
          </div>

          <div className="navbar-actions">
            {user ? (
              <>
                <div className="navbar-user">
                  <img src={user.profilePic||'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'} alt={user.name} className="navbar-user-avatar" onError={e=>{e.target.src='https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';}}/>
                  <div className="navbar-user-info">
                    <span className="navbar-user-name">{user.name}</span>
                    <span className="navbar-user-role">{user.role}</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm focus-ring" onClick={() => { setUser(null); setActiveTab('home'); }}>Sign Out</button>
              </>
            ) : (
              <button id="btn-signin" className="btn btn-primary btn-sm focus-ring" onClick={() => setShowAuth(true)}>Sign In</button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={u => setUser(u)}/>}

      {/* Pages */}
      {activeTab === 'home'        && <HomePage user={user} onShowAuth={() => setShowAuth(true)}/>}
      {activeTab === 'cases'       && <CasesPage onSelectCase={handleSelectCase}/>}
      {activeTab === 'case-detail' && selectedCase && <CaseDetailPage caseData={selectedCase} onBack={handleBackFromCase}/>}
      {activeTab === 'dashboard'   && user && <DashboardPage user={user}/>}
      {activeTab === 'about'       && <AboutPage onShowAuth={() => setShowAuth(true)} user={user}/>}

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-icon" aria-hidden="true">⚖</div>
            <span className="footer-brand-name">LEX-RATING</span>
          </div>
          <nav className="footer-links" aria-label="Footer links">
            <span className="footer-link" onClick={() => setActiveTab('about')}>About</span>
            <span className="footer-link" onClick={() => setActiveTab('cases')}>Cases</span>
            <span className="footer-link">Privacy Directive</span>
            <span className="footer-link">Support</span>
          </nav>
          <span className="footer-copy">© 2026 Ministry of Justice & Court Automation Dept.</span>
        </div>
      </footer>
    </div>
  );
}
