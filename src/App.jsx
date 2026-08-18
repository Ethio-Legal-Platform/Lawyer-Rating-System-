import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { LEGAL_GUIDES } from './data/legalGuides';
import { getStoredUser, storeUser, clearStoredUser, getToken, storeToken, clearToken } from './utils/storage';

const API_BASE = 'http://localhost:5000/api';

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
}

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

const GUIDES_DATA = LEGAL_GUIDES;

// ─── Reusable Modal Backdrop (Safe for Text Selection & Dragging) ─────────────
function ModalBackdrop({ children, onClose, className = '', style = {} }) {
  const isDirectBackdropClick = React.useRef(false);

  return (
    <div
      className={`modal-backdrop ${className}`}
      style={style}
      onMouseDown={(e) => {
        // Only mark true if mousedown started directly on the backdrop itself (not inside the modal content)
        isDirectBackdropClick.current = (e.target === e.currentTarget);
      }}
      onClick={(e) => {
        // Only trigger close if both mousedown and click originated directly on the backdrop
        if (isDirectBackdropClick.current && e.target === e.currentTarget && onClose) {
          onClose();
        }
        isDirectBackdropClick.current = false;
      }}
    >
      {children}
    </div>
  );
}

// ─── Legal Guide Reader Modal ────────────────────────────────────────────────
function GuideModal({ guide, onClose, onConsultAdvocate }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!guide) return null;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="guide-reader-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="guide-reader-header" style={{ background: `linear-gradient(135deg, #003366, ${guide.color || '#005a9e'})` }}>
          <div className="guide-cat">{guide.cat}</div>
          <h2 className="guide-reader-title">{guide.title}</h2>
          <p className="guide-reader-subtitle">{guide.subtitle}</p>
          <div className="guide-reader-meta">
            <span>✍️ {guide.author}</span>
            <span>📅 {guide.updated}</span>
            <span>⏱️ {guide.read}</span>
          </div>
          <button className="lawyer-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="guide-reader-body">
          {/* Summary Box */}
          <div className="guide-summary-box">
            <strong>Executive Summary</strong>
            {guide.summary}
          </div>

          {/* Proclamations & Statutes cited */}
          {guide.proclamations && guide.proclamations.length > 0 && (
            <div className="guide-proclamations-box">
              <div className="guide-proclamations-title">
                <span>Governing Ethiopian Laws & Proclamations</span>
              </div>
              <ul className="guide-proclamations-list">
                {guide.proclamations.map(p => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Sections */}
          {guide.sections && guide.sections.map((sec, idx) => (
            <div key={idx} className="guide-article-section">
              <h3>{sec.heading}</h3>
              <p>{sec.content}</p>
              {sec.alert && (
                <div className="guide-alert-box">
                  ⚠️ <strong>Important Note:</strong> {sec.alert.text}
                </div>
              )}
            </div>
          ))}

          {/* Key Takeaways */}
          {guide.keyTakeaways && (
            <div className="guide-takeaways-box">
              <div className="guide-takeaways-title">
                <span>✅ Key Takeaways & Checklist</span>
              </div>
              <ul className="guide-takeaways-list">
                {guide.keyTakeaways.map((item, idx) => (
                  <li key={idx}>
                    <span className="check">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FAQs */}
          {guide.faqs && guide.faqs.length > 0 && (
            <div className="guide-faqs-section">
              <h3 className="guide-faqs-title">Frequently Asked Questions</h3>
              {guide.faqs.map((faq, idx) => (
                <div key={idx} className="guide-faq-item">
                  <div className="guide-faq-q">Q: {faq.q}</div>
                  <div className="guide-faq-a">{faq.a}</div>
                </div>
              ))}
            </div>
          )}

          {/* Advocate CTA */}
          <div className="guide-advocate-cta">
            <h4>Need Personalized Representation or Document Review?</h4>
            <p>
              Connect with MoJ-verified Ethiopian advocates specialized in {guide.cat} to represent you or review your legal files.
            </p>
            <button className="btn btn-white btn-lg" onClick={() => {
              onClose();
              if (onConsultAdvocate) onConsultAdvocate(guide.cat);
            }}>
              Find {guide.cat} Advocates →
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─── Interactive Question Thread Modal ───────────────────────────────────────
function QuestionThreadModal({ questionId, currentUser, onClose, onRefreshList, onOpenAuth }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadQuestion = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/qa/questions/${questionId}`);
      const data = await res.json();
      if (res.ok) setQuestion(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleUpvote = async (answerId) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    try {
      const res = await authFetch(`${API_BASE}/qa/questions/${questionId}/answers/${answerId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        loadQuestion();
        if (onRefreshList) onRefreshList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublish = async () => {
    if (!currentUser || currentUser.id !== question?.authorId) return;
    setPublishing(true);
    try {
      const res = await authFetch(`${API_BASE}/qa/questions/${questionId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        await loadQuestion();
        if (onRefreshList) onRefreshList();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPublishing(false);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!replyText.trim()) return;
    setSubmitting(true);

    try {
      const isLawyer = currentUser.role === 'lawyer';
      const payload = {
        content: replyText,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorUsername: currentUser.username,
        authorRole: currentUser.role,
        isLawyer: Boolean(isLawyer),
        licenseNumber: isLawyer ? currentUser.licenseNumber : null,
        specialization: isLawyer ? currentUser.specialization : null,
        elo: isLawyer ? currentUser.elo : null,
        profilePic: currentUser.profilePic || null,
        city: currentUser.city || 'Ethiopia'
      };

      const res = await authFetch(`${API_BASE}/qa/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setReplyText('');
        loadQuestion();
        if (onRefreshList) onRefreshList();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!question && loading) {
    return (
      <ModalBackdrop onClose={onClose}>
        <div className="qa-thread-modal" style={{ padding: '4rem', textAlign: 'center' }}>
          <span className="loading-dots"><span/><span/><span/></span>
        </div>
      </ModalBackdrop>
    );
  }

  if (!question) return null;

  const lawyerAnswers = (question.answers || []).filter(a => a.isLawyer);
  const communityAnswers = (question.answers || []).filter(a => !a.isLawyer);
  const isAuthor = currentUser && currentUser.id === question.authorId;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="qa-thread-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="qa-thread-header">
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div className="qa-tag">{question.category} Law</div>
            {question.isPrivate ? (
              <span style={{ fontSize: '1.2rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.8rem', borderRadius: 99, fontWeight: 700 }}>
                🔒 Private Consultation
              </span>
            ) : (
              <span style={{ fontSize: '1.2rem', background: '#f0fdf4', color: '#166534', padding: '0.2rem 0.8rem', borderRadius: 99, fontWeight: 700 }}>
                🌐 Public Forum
              </span>
            )}
          </div>
          <h2 className="qa-thread-title">{question.title}</h2>
          <div className="qa-thread-meta">
            <span>📍 {question.city || 'Ethiopia'}</span>
            <span>👤 Asked by {question.authorName || 'Litigant'}</span>
            <span>📅 {new Date(question.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>💬 {(question.answers || []).length} Responses</span>
          </div>
          <button className="lawyer-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="qa-thread-body">
          {/* Question Description Box */}
          <div className="qa-question-box">
            <h4 style={{ fontSize: '1.3rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>
              Question Details & Facts
            </h4>
            <p className="qa-question-desc">{question.description}</p>
          </div>

          {/* Author Publish-to-Public Banner for Private Inquiries */}
          {question.isPrivate && isAuthor && (
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1.5px solid #86efac', borderRadius: 8, padding: '1.6rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#166534', marginBottom: '0.2rem' }}>
                  📢 Share this Legal Guidance with the Public?
                </div>
                <div style={{ fontSize: '1.3rem', color: '#15803d' }}>
                  Once you agree, this question and the advocate's response will be published to the public Q&A forum for other citizens to benefit.
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ background: '#16a34a', borderColor: '#16a34a', whiteSpace: 'nowrap' }}
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? 'Publishing…' : 'Publish to Public Forum 🌐'}
              </button>
            </div>
          )}

          {/* Answers Header */}
          <div className="qa-answers-header">
            <div className="qa-answers-title">
              <span>Legal Answers & Discussion</span>
              <span style={{ fontSize: '1.4rem', color: 'var(--gray-500)', fontWeight: 400 }}>
                ({(question.answers || []).length} total)
              </span>
            </div>
            {lawyerAnswers.length > 0 && (
              <span className="qa-advocate-badge-count">
                ⚖️ {lawyerAnswers.length} Verified Advocate Answer{lawyerAnswers.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Lawyer Answers (Prominent Top Section) */}
          {lawyerAnswers.map(ans => {
            const hasUpvoted = currentUser && Array.isArray(ans.upvotedBy) && ans.upvotedBy.includes(currentUser.id);
            return (
              <div key={ans.id} className="qa-lawyer-card">
                <div className="qa-lawyer-banner">
                  <div className="qa-lawyer-banner-tag">
                    <span>⚖️</span>
                    <span>VERIFIED ADVOCATE ANSWER</span>
                  </div>
                  <span>MoJ Licensed Practitioner</span>
                </div>
                <div className="qa-lawyer-card-inner">
                  <div className="qa-lawyer-header">
                    <img
                      src={ans.profilePic}
                      alt={ans.authorName}
                      className="qa-lawyer-avatar"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'; }}
                    />
                    <div className="qa-lawyer-info">
                      <div className="qa-lawyer-name">{ans.authorName}</div>
                      <div className="qa-lawyer-meta-tags">
                        {ans.specialization && <span className="qa-tag-license">{ans.specialization} Advocate</span>}
                        {ans.licenseNumber && <span className="qa-tag-license">🔖 {ans.licenseNumber}</span>}
                        {ans.elo && <span className="qa-tag-elo">⚡ ELO {ans.elo}</span>}
                        {ans.city && <span style={{ fontSize: '1.2rem', color: 'var(--gray-500)' }}>📍 {ans.city}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="qa-lawyer-content">{ans.content}</div>
                  <div className="qa-answer-footer">
                    <span>Answered {new Date(ans.createdAt).toLocaleDateString()}</span>
                    <button
                      className="qa-upvote-btn"
                      style={hasUpvoted ? { background: '#e8f4fb', borderColor: 'var(--blue)', color: 'var(--blue)', fontWeight: 800 } : {}}
                      onClick={() => handleUpvote(ans.id)}
                      title={currentUser ? (hasUpvoted ? 'Click to remove upvote' : 'Mark as helpful') : 'Sign in to mark as helpful'}
                    >
                      ▲ {hasUpvoted ? 'Helpful ✓' : 'Helpful'} ({ans.upvotes || 0})
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Community Answers */}
          {communityAnswers.map(ans => {
            const hasUpvoted = currentUser && Array.isArray(ans.upvotedBy) && ans.upvotedBy.includes(currentUser.id);
            return (
              <div key={ans.id} className="qa-client-card">
                <div className="qa-client-header">
                  <img
                    src={ans.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                    alt={ans.authorName}
                    className="qa-client-avatar"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'; }}
                  />
                  <div>
                    <div className="qa-client-name">{ans.authorName}</div>
                    <div className="qa-client-role">👤 Litigant / Community Contributor</div>
                  </div>
                </div>
                <div className="qa-client-content">{ans.content}</div>
                <div className="qa-answer-footer">
                  <span>Posted {new Date(ans.createdAt).toLocaleDateString()}</span>
                  <button
                    className="qa-upvote-btn"
                    style={hasUpvoted ? { background: '#e8f4fb', borderColor: 'var(--blue)', color: 'var(--blue)', fontWeight: 800 } : {}}
                    onClick={() => handleUpvote(ans.id)}
                    title={currentUser ? (hasUpvoted ? 'Click to remove upvote' : 'Mark as helpful') : 'Sign in to mark as helpful'}
                  >
                    ▲ {hasUpvoted ? 'Helpful ✓' : 'Helpful'} ({ans.upvotes || 0})
                  </button>
                </div>
              </div>
            );
          })}

          {/* No answers yet */}
          {(question.answers || []).length === 0 && (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '2.4rem', textAlign: 'center', color: 'var(--gray-500)' }}>
              <span style={{ fontSize: '2.8rem', display: 'block', marginBottom: '0.6rem' }}>⚖️</span>
              <p style={{ fontWeight: 700, fontSize: '1.6rem', color: 'var(--gray-700)', marginBottom: '0.4rem' }}>No responses yet</p>
              <p style={{ fontSize: '1.4rem' }}>
                {question.isPrivate
                  ? 'Nearby advocates have received your inquiry and will respond soon.'
                  : 'Be the first to provide legal guidance or community insight on this matter!'}
              </p>
            </div>
          )}

          {/* Reply Submission Box (Requires Authentication) */}
          {currentUser ? (
            <div className="qa-reply-box">
              <div className="qa-reply-title">
                {currentUser.role === 'lawyer'
                  ? `⚖️ Post Verified Advocate Answer as ${currentUser.name}`
                  : `💬 Post a Reply as ${currentUser.name}`}
              </div>
              <div className="qa-reply-sub">
                {currentUser.role === 'lawyer'
                  ? 'Your reply will be displayed with your verified Ministry of Justice credentials and ELO rating badge.'
                  : 'Share your perspective, question clarification, or legal experience.'}
              </div>

              <form onSubmit={handlePostAnswer}>
                <textarea
                  className="qa-reply-textarea"
                  placeholder={
                    currentUser.role === 'lawyer'
                      ? 'Write your professional legal opinion citing relevant Ethiopian laws or proclamations…'
                      : 'Share your perspective, experience, or advice…'
                  }
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  required
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', color: 'var(--gray-500)' }}>
                    {currentUser.role === 'lawyer' ? '🛡️ Verified Advocate Response' : '👥 Community Post'}
                  </span>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !replyText.trim()}
                    style={{ background: currentUser.role === 'lawyer' ? '#1c3024' : 'var(--orange)' }}
                  >
                    {submitting ? 'Posting…' : currentUser.role === 'lawyer' ? 'Post Advocate Answer ⚖️' : 'Post Reply'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="qa-reply-box" style={{ textAlign: 'center', padding: '3.2rem 2rem' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.8rem' }}>🔒</span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.6rem' }}>
                Sign In to Answer or Comment
              </h3>
              <p style={{ fontSize: '1.45rem', color: 'var(--gray-500)', maxWidth: 480, margin: '0 auto 2rem' }}>
                Registered litigants and licensed advocates can answer or comment on questions. Unregistered visitors can freely browse and read all discussions.
              </p>
              <button className="btn btn-primary btn-lg" onClick={onOpenAuth}>
                Sign In / Register to Participate →
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─── Ask Legal Question Modal ─────────────────────────────────────────────────
function AskQuestionModal({ currentUser, onClose, onQuestionCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Criminal');
  const [city, setCity] = useState(currentUser?.city || 'Addis Ababa');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be signed in to submit a question.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Please provide both a title and details for your question.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        city,
        authorName: authorName.trim() || currentUser.name,
        authorRole: currentUser.role || 'client',
        authorId: currentUser.id,
        isPrivate: Boolean(isPrivate)
      };

      const res = await authFetch(`${API_BASE}/qa/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        if (onQuestionCreated) onQuestionCreated(data.question);
        onClose();
      } else {
        setError(data.error || 'Failed to submit question.');
      }
    } catch (err) {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="auth-modal" style={{ maxWidth: 620 }} role="dialog" aria-modal="true">
        <div className="auth-modal-header">
          <div className="auth-modal-title">Ask a Legal Question</div>
          <div className="auth-modal-sub">Connect with Ministry of Justice verified advocates in Ethiopia</div>
          <button className="auth-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="auth-body">
          {error && <div className="alert alert-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Privacy Mode Selector */}
            <div className="form-group" style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: '1.4rem', marginBottom: '1.6rem' }}>
              <label className="form-label" style={{ marginBottom: '0.8rem', fontWeight: 800 }}>Inquiry Privacy Mode</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
                  <input type="radio" name="privacy" checked={!isPrivate} onChange={() => setIsPrivate(false)} style={{ accentColor: '#f55d25', marginTop: '0.3rem' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--gray-900)' }}>🌐 Public Legal Q&A</div>
                    <div style={{ fontSize: '1.25rem', color: 'var(--gray-500)' }}>Visible on the community forum so verified advocates and litigants can discuss publicly.</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
                  <input type="radio" name="privacy" checked={isPrivate} onChange={() => setIsPrivate(true)} style={{ accentColor: '#f55d25', marginTop: '0.3rem' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.4rem', color: '#008cc9' }}>🔒 Private Inquiry (Nearby Advocate First)</div>
                    <div style={{ fontSize: '1.25rem', color: 'var(--gray-500)' }}>Sent privately to verified advocates in {city}. You can review their answer and publish to the public forum with 1 click anytime!</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Question Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Can my landlord increase rent without notice?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div className="form-group">
                <label className="form-label">Legal Category *</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {['Criminal', 'Corporate', 'Family', 'Civil', 'Labour', 'Immigration', 'Land'].map(c => (
                    <option key={c} value={c}>{c} Law</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
                  {ETHIOPIAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Facts & Situation *</label>
              <textarea
                className="form-textarea"
                style={{ height: '12rem' }}
                placeholder="Describe your situation in detail. What happened, what documents do you have, and what specific advice do you need?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Name or Pseudonym</label>
              <input
                type="text"
                className="form-input"
                placeholder={currentUser ? currentUser.name : 'e.g. Anonymous Litigant'}
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
              />
              <p className="form-helper">
                {isPrivate ? '🔒 Private inquiry visible only to nearby verified advocates.' : '🌐 Public question visible to the legal community.'}
              </p>
            </div>

            <button type="submit" className="btn btn-orange btn-full" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : isPrivate ? 'Send Private Inquiry to Nearby Advocates' : 'Submit Question to Public Forum'}
            </button>
          </form>
        </div>
      </div>
    </ModalBackdrop>
  );
}

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

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="lawyer-modal" role="dialog" aria-modal="true">
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
              <span className="lawyer-modal-tag" style={{ background: '#f55d25', border: 'none', fontWeight: 700 }}>
                ⚡ ELO {lawyer.elo}
              </span>
              <span className={`lawyer-modal-tag`} style={{ background: avvoRating >= 8 ? '#52a304' : avvoRating >= 6 ? '#8bc34a' : '#fc9835', border: 'none' }}>
                ★ {avvoRating} / 10
              </span>
            </div>
          </div>
          <button className="lawyer-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        <div className="lawyer-modal-tabs">
          {['overview','awards','background'].map(t => (
            <button key={t} className={`lawyer-modal-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? 'Overview' : t === 'awards' ? '💬 Community Activity' : 'Background'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="lawyer-modal-body">
          {tab === 'overview' && (
            <>
              {/* ELO and Profile Stats */}
              <div className="modal-stats-row">
                <div className="modal-stat-box" style={{ borderTop: '3px solid #f55d25' }}>
                  <span className="modal-stat-num gold">{lawyer.elo}</span>
                  <span className="modal-stat-label">ELO Rating</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #52a304' }}>
                  <span className="modal-stat-num green">{avvoRating} <span style={{ fontSize: '1.2rem', color: '#777' }}>/ 10</span></span>
                  <span className="modal-stat-label">Platform Score</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #008cc9' }}>
                  <span className="modal-stat-num blue">{lawyer.casesCount}</span>
                  <span className="modal-stat-label">Cases Handled</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #8b5cf6' }}>
                  <span className="modal-stat-num" style={{ color: '#8b5cf6' }}>{lawyer.yearsExperience > 0 ? `${lawyer.yearsExperience} yrs` : 'Verified'}</span>
                  <span className="modal-stat-label">Experience</span>
                </div>
              </div>

              <EloBar elo={lawyer.elo} />

              {/* Star rating */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', margin:'1.2rem 0', fontSize:'1.4rem', color:'#555' }}>
                <StarRow rating={lawyer.rating} />
                <span>{lawyer.rating.toFixed(1)} average performance rating (MoJ verified)</span>
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

          {tab === 'awards' && (
            <>
              {/* Interaction score & Community Stats */}
              <div className="modal-stats-row" style={{ marginBottom: '2rem' }}>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #f59e0b' }}>
                  <span className="modal-stat-num gold">{lawyer.interactionScore || 0}</span>
                  <span className="modal-stat-label">Activity Points</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #52a304' }}>
                  <span className="modal-stat-num green">▲ {lawyer.helpfulVotesReceived || 0}</span>
                  <span className="modal-stat-label">Helpful Votes</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #8b5cf6' }}>
                  <span className="modal-stat-num" style={{ color: '#8b5cf6' }}>
                    {lawyer.interactionRank ? `#${lawyer.interactionRank}` : 'Top 10'}
                  </span>
                  <span className="modal-stat-label">National Rank</span>
                </div>
              </div>

              <div className="modal-section-title" style={{ marginBottom: '1.2rem' }}>
                ⭐ Community Recognition & Highlights
              </div>

              {lawyer.awards && lawyer.awards.length > 0 ? (
                <div>
                  {lawyer.awards.map((aw, idx) => (
                    <div key={idx} className="award-plaque gold">
                      <div className="award-plaque-icon">{aw.icon || '⭐'}</div>
                      <div style={{ flex: 1 }}>
                        <span className="award-tier-tag" style={{ background: '#fef3c7', color: '#92400e' }}>
                          {aw.tier || 'Verified'}
                        </span>
                        <div className="award-plaque-title">{aw.title}</div>
                        <div className="award-plaque-desc">{aw.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#f9f9f9', border: '1px dashed var(--border)', borderRadius: 8, padding: '2.4rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                  <span style={{ fontSize: '2.8rem', display: 'block', marginBottom: '0.6rem' }}>🎖️</span>
                  <p style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--gray-700)', marginBottom: '0.4rem' }}>
                    Active Legal Contributor
                  </p>
                  <p style={{ fontSize: '1.35rem' }}>
                    Answer citizens legal questions in the Q&A forum and handle cases to build verified community standing.
                  </p>
                </div>
              )}

              <div className="modal-section" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '1.2rem', marginTop: '1.6rem' }}>
                <div style={{ fontSize: '1.3rem', color: '#166534', fontWeight: 600 }}>
                  ⚖️ Community Impact Program · Recognition granted based on verified public legal answers, citizen helpfulness votes, and courtroom litigation volume.
                </div>
              </div>
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
    </ModalBackdrop>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onLogin }) {
  const [tab, setTab]           = useState('login');
  const [step, setStep]         = useState('form');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
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
      if (res.ok) {
        setSuccess(`Welcome back, ${data.user.name}!`);
        if (data.token) storeToken(data.token);
        setTimeout(() => { onLogin(data.user, data.token); onClose(); }, 700);
      } else {
        setError(data.error || 'Login failed. Check your credentials.');
      }
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

  const handleResendOtp = async () => {
    clear(); setResending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail })
      });
      const data = await res.json();
      if (res.ok) {
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
    e.preventDefault(); clear(); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register-verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: otpEmail, code: otpCode }) });
      const data = await res.json();
      if (res.ok) { setSuccess('Verified! Please sign in.'); setTimeout(() => { setTab('login'); setStep('form'); clear(); }, 1200); }
      else setError(data.error || 'Invalid code.');
    } catch { setError('Cannot reach server.'); } finally { setLoading(false); }
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
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={handleResendOtp} disabled={resending}>
                  {resending ? 'Sending…' : 'Resend Code'}
                </button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setStep('form'); setOtpCode(''); clear(); }}>← Back</button>
              </div>
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
    </ModalBackdrop>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]                 = useState(getStoredUser);
  const [showAuth, setShowAuth]         = useState(false);
  const [page, setPage]                 = useState('home'); // 'home'|'directory'|'guides'|'about'|'qa'
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedGuide, setSelectedGuide]   = useState(null);
  const [guideCat, setGuideCat]             = useState('All');

  // Q&A state
  const [questions, setQuestions]           = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [showAskModal, setShowAskModal]     = useState(false);
  const [qaCatFilter, setQaCatFilter]       = useState('All');
  const [qaSearchTerm, setQaSearchTerm]     = useState('');
  const [qaTab, setQaTab]                   = useState('public'); // 'public' | 'private'
  const [privateInquiries, setPrivateInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Directory state
  const [lawyers, setLawyers]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searchSpec, setSearchSpec]     = useState('');
  const [searchCity, setSearchCity]     = useState('');
  const [specInput, setSpecInput]       = useState('');
  const [cityInput, setCityInput]       = useState('');

  // Interaction Leaderboard
  const [leaderboard, setLeaderboard]   = useState([]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/lawyers/leaderboard`);
      const data = await res.json();
      if (Array.isArray(data)) setLeaderboard(data.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchPrivateInquiries = useCallback(async () => {
    if (!user) {
      setPrivateInquiries([]);
      return;
    }
    setLoadingInquiries(true);
    try {
      const params = new URLSearchParams();
      params.append('userId', user.id);
      params.append('role', user.role || 'client');
      if (user.city) params.append('city', user.city);
      if (user.specialization) params.append('specialization', user.specialization);
      const res = await authFetch(`${API_BASE}/qa/inquiries?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setPrivateInquiries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInquiries(false);
    }
  }, [user]);

  const fetchLawyers = useCallback(async (spec = '', city = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (spec) params.append('specialization', spec);
      if (city) params.append('city', city);
      const res  = await authFetch(`${API_BASE}/lawyers/search?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setLawyers(data);
    } catch { setLawyers([]); } finally { setLoading(false); }
  }, []);

  const fetchQuestions = useCallback(async (cat = 'All', search = '') => {
    setLoadingQuestions(true);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== 'All') params.append('category', cat);
      if (search) params.append('search', search);
      const res = await authFetch(`${API_BASE}/qa/questions?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setQuestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useEffect(() => { fetchLawyers('', ''); }, [fetchLawyers]);
  useEffect(() => { fetchQuestions(qaCatFilter, qaSearchTerm); }, [fetchQuestions, qaCatFilter, qaSearchTerm]);
  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);
  useEffect(() => { fetchPrivateInquiries(); }, [fetchPrivateInquiries]);

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
  const consultFromGuide = (cat) => {
    let spec = '';
    if (cat.includes('Criminal')) spec = 'Criminal';
    else if (cat.includes('Family')) spec = 'Family';
    else if (cat.includes('Corporate') || cat.includes('Intellectual')) spec = 'Corporate';
    else if (cat.includes('Civil') || cat.includes('Labour')) spec = 'Civil';
    setSearchSpec(spec);
    setSpecInput(spec);
    fetchLawyers(spec, searchCity);
    setPage('directory');
  };
  const handleLogin = (nextUser, token) => {
    if (token) storeToken(token);
    storeUser(nextUser);
    setUser(nextUser);
  };
  const logout = () => {
    clearToken();
    clearStoredUser();
    setUser(null);
  };

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
                  {user.role === 'lawyer' && <span style={{ background: '#f55d25', color: '#fff', fontSize: '1.1rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 99 }}>Advocate</span>}
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
      {selectedLawyer && <LawyerModal lawyer={selectedLawyer} onClose={() => setSelectedLawyer(null)} />}
      {selectedGuide && (
        <GuideModal
          guide={selectedGuide}
          onClose={() => setSelectedGuide(null)}
          onConsultAdvocate={consultFromGuide}
        />
      )}
      {selectedQuestionId && (
        <QuestionThreadModal
          questionId={selectedQuestionId}
          currentUser={user}
          onClose={() => setSelectedQuestionId(null)}
          onRefreshList={() => fetchQuestions(qaCatFilter, qaSearchTerm)}
          onOpenAuth={() => setShowAuth(true)}
        />
      )}
      {showAskModal && (
        <AskQuestionModal
          currentUser={user}
          onClose={() => setShowAskModal(false)}
          onQuestionCreated={(newQ) => {
            fetchQuestions(qaCatFilter, qaSearchTerm);
            if (newQ?.id) setSelectedQuestionId(newQ.id);
          }}
        />
      )}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />}

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

          {/* Most Interactive Advocates Podium */}
          {leaderboard.length > 0 && (
            <section className="avvo-section avvo-section-white" style={{ borderTop: '1px solid var(--border)', background: '#fafbfc' }}>
              <div className="container">
                <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 2.8rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f55d25', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    ⭐ 2026 Community Recognition
                  </span>
                  <h2 className="avvo-section-title" style={{ marginTop: '0.4rem', marginBottom: '0.6rem' }}>
                    Most Interactive Advocates of the Year
                  </h2>
                  <p className="avvo-section-sub" style={{ marginBottom: 0 }}>
                    Honoring the most engaged advocates answering citizen legal questions, providing verified guidance, and receiving top community helpfulness ratings.
                  </p>
                </div>

                <div className="leaderboard-grid">
                  {leaderboard.map((lawyer, idx) => {
                    const topAw = lawyer.awards && lawyer.awards.length > 0 ? lawyer.awards[0] : null;
                    const crownLabel = idx === 0 ? '🏆 Rank #1 Advocate' : idx === 1 ? '⭐ Rank #2 Advocate' : '🌟 Rank #3 Advocate';
                    return (
                      <div
                        key={lawyer.id}
                        className={`leaderboard-card rank-${idx + 1}`}
                        onClick={() => {
                          const fullLawyer = lawyers.find(l => l.id === lawyer.id) || lawyer;
                          setSelectedLawyer(fullLawyer);
                        }}
                      >
                        <span className="leaderboard-rank-crown" style={{
                          background: idx === 0 ? '#f59e0b' : idx === 1 ? '#64748b' : '#ea580c'
                        }}>
                          {crownLabel}
                        </span>
                        <img
                          src={lawyer.profilePic}
                          alt={lawyer.name}
                          className="leaderboard-avatar"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'; }}
                        />
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.3rem' }}>
                          {lawyer.name}
                        </h3>
                        <div style={{ fontSize: '1.35rem', color: 'var(--blue)', fontWeight: 600, marginBottom: '0.6rem' }}>
                          {lawyer.specialization} Law · 📍 {lawyer.city}
                        </div>
                        {topAw && (
                          <div style={{ fontSize: '1.2rem', color: '#92400e', background: '#fef3c7', padding: '0.3rem 0.8rem', borderRadius: 99, display: 'inline-block', fontWeight: 700, marginBottom: '1.2rem' }}>
                            {topAw.title}
                          </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', background: '#f8fafc', padding: '1rem', borderRadius: 8, marginBottom: '1.4rem', textAlign: 'center' }}>
                          <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue)' }}>{lawyer.interactionScore || 0}</div>
                            <div style={{ fontSize: '1.15rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Activity Points</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#52a304' }}>▲ {lawyer.helpfulVotesReceived || 0}</div>
                            <div style={{ fontSize: '1.15rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Helpful Votes</div>
                          </div>
                        </div>
                        <button className="btn btn-primary btn-sm btn-full">
                          View Advocate Profile →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Legal Guides */}
          <section className="avvo-section avvo-section-white">
            <div className="container">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem', marginBottom:'0.4rem' }}>
                <div>
                  <h2 className="avvo-section-title" style={{ marginBottom:'0.3rem' }}>Legal Guides & Articles</h2>
                  <p className="avvo-section-sub" style={{ marginBottom:0 }}>Plain-language explanations of Ethiopian laws and procedures.</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage('guides')}>All Guides →</button>
              </div>
              <div className="guides-grid">
                {GUIDES_DATA.slice(0, 3).map(g => (
                  <div key={g.id} className="guide-card" onClick={() => setSelectedGuide(g)}>
                    <div className="guide-card-color" style={{ background: g.color || 'var(--orange)' }} />
                    <div className="guide-card-body">
                      <div className="guide-cat">{g.cat}</div>
                      <div className="guide-title">{g.title}</div>
                      <p style={{ fontSize: '1.35rem', color: 'var(--gray-500)', lineHeight: 1.45, marginBottom: '0.8rem' }}>
                        {g.subtitle}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <span className="guide-read">📖 {g.read}</span>
                        <span style={{ fontSize: '1.3rem', color: 'var(--blue)', fontWeight: 700 }}>Read Article →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ══════════════════════════════════════════ DIRECTORY ══════════════════════ */}
      {page === 'directory' && (
        <div className="directory-layout container">
          {/* Sidebar */}
          <aside className="dir-sidebar">
            <h3>Practice Area</h3>
            <ul className="sidebar-spec-list">
              <li className={`sidebar-spec-item${!searchSpec?' active':''}`} onClick={() => { setSearchSpec(''); setSpecInput(''); fetchLawyers('', searchCity); }}>
                <span className="sidebar-spec-icon">★</span> All Practice Areas
              </li>
              {[
                { spec:'Criminal', icon:'⚖️' },
                { spec:'Corporate', icon:'🏢' },
                { spec:'Family', icon:'👨‍👩‍👧' },
                { spec:'Civil', icon:'📜' },
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
          <div className="dir-main-content">
            {/* Search bar */}
            <div className="dir-search-wrap">
              <div className="dir-search-row">
                <div className="dir-search-field" style={{ flex:2 }}>
                  <span className="dir-search-icon">⚖</span>
                  <input type="text" placeholder="Practice area or advocate name…" value={specInput} list="spec-list2"
                    onChange={e => {
                      const val = e.target.value;
                      setSpecInput(val);
                      setSearchSpec(val);
                      fetchLawyers(val, cityInput);
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') fetchLawyers(specInput, cityInput); }}
                  />
                  <datalist id="spec-list2">
                    {['Criminal','Corporate','Family','Civil'].map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div className="dir-search-field" style={{ flex:2 }}>
                  <span className="dir-search-icon">📍</span>
                  <input type="text" placeholder="City…" value={cityInput} list="city-list2"
                    onChange={e => {
                      const val = e.target.value;
                      setCityInput(val);
                      setSearchCity(val);
                      fetchLawyers(specInput, val);
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') fetchLawyers(specInput, cityInput); }}
                  />
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
                <p className="empty-sub">Try broadening your search or clearing filters.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════ Q&A ═══════════════════════════ */}
      {/* ══════════════════════════════════════════ Q&A ═══════════════════════════ */}
      {page === 'qa' && (
        <section className="avvo-section avvo-section-gray" style={{ minHeight:'60vh' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.6rem', marginBottom: '2rem' }}>
              <div>
                <h1 className="avvo-section-title" style={{ marginBottom: '0.4rem' }}>Legal Q&A & Consultations</h1>
                <p className="avvo-section-sub" style={{ marginBottom: 0 }}>
                  Ask questions publicly or privately to nearby Ethiopian advocates.
                </p>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => { if (!user) setShowAuth(true); else setShowAskModal(true); }}>
                Ask a Legal Question ＋
              </button>
            </div>

            {/* Q&A Tab Switcher: Public Forum vs My Private Inquiries */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border)', marginBottom: '2.4rem' }}>
              <button
                className={`btn btn-sm ${qaTab === 'public' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '6px 6px 0 0', padding: '1rem 2rem', fontSize: '1.4rem', fontWeight: 700 }}
                onClick={() => setQaTab('public')}
              >
                🌐 Public Q&A Forum
              </button>
              <button
                className={`btn btn-sm ${qaTab === 'private' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '6px 6px 0 0', padding: '1rem 2rem', fontSize: '1.4rem', fontWeight: 700 }}
                onClick={() => {
                  if (!user) {
                    setShowAuth(true);
                  } else {
                    setQaTab('private');
                    fetchPrivateInquiries();
                  }
                }}
              >
                🔒 My Private Inquiries {user && privateInquiries.length > 0 ? `(${privateInquiries.length})` : ''}
              </button>
            </div>

            {qaTab === 'public' && (
              <>
                {/* Q&A Search & Category Filter Bar */}
                <div className="dir-search-wrap" style={{ marginBottom: '2.4rem' }}>
                  <div className="dir-search-row">
                    <div className="dir-search-field" style={{ flex: 3 }}>
                      <span className="dir-search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search legal questions, terms, or topics (e.g. bail, divorce, lease, employment)…"
                        value={qaSearchTerm}
                        onChange={e => setQaSearchTerm(e.target.value)}
                      />
                    </div>
                    {qaSearchTerm && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setQaSearchTerm('')}>Clear ✕</button>
                    )}
                  </div>

                  <div className="filter-chips">
                    {['All', 'Criminal', 'Family', 'Corporate', 'Civil', 'Labour', 'Immigration', 'Land'].map(cat => (
                      <button
                        key={cat}
                        className={`filter-chip${qaCatFilter === cat ? ' active' : ''}`}
                        onClick={() => setQaCatFilter(cat)}
                      >
                        {cat} {cat !== 'All' ? 'Law' : 'Questions'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Questions Grid */}
                {loadingQuestions ? (
                  <div className="loading-state">Loading questions <span className="loading-dots"><span/><span/><span/></span></div>
                ) : questions.length > 0 ? (
                  <div className="qa-grid" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {questions.map(q => {
                      const hasLawyer = (q.answers || []).some(a => a.isLawyer);
                      return (
                        <div key={q.id} className="qa-card" onClick={() => setSelectedQuestionId(q.id)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', gap: '0.6rem' }}>
                            <span className="qa-tag">{q.category} Law</span>
                            {hasLawyer ? (
                              <span style={{ fontSize: '1.15rem', color: '#c2410c', background: '#fff4f0', border: '1px solid #ffd0b0', padding: '0.2rem 0.6rem', borderRadius: 99, fontWeight: 700 }}>
                                ⚖️ Advocate Verified
                              </span>
                            ) : (
                              <span style={{ fontSize: '1.15rem', color: '#555', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: 99 }}>
                                💬 Community
                              </span>
                            )}
                          </div>
                          <p className="qa-question">{q.title}</p>
                          <p style={{ fontSize: '1.35rem', color: 'var(--gray-700)', lineHeight: 1.45, marginBottom: '1.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {q.description}
                          </p>
                          <div className="qa-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                            <span className="qa-answers">✓ {(q.answers || []).length} responses</span>
                            <span>📍 {q.city || 'Ethiopia'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">💬</span>
                    <p className="empty-title">No questions found</p>
                    <p className="empty-sub">Be the first to ask a legal question in this category or search term.</p>
                    <button className="btn btn-primary" onClick={() => { if (!user) setShowAuth(true); else setShowAskModal(true); }}>Ask a Free Question</button>
                  </div>
                )}
              </>
            )}

            {qaTab === 'private' && (
              <div>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '1.6rem 2rem', marginBottom: '2rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0369a1', marginBottom: '0.4rem' }}>
                    🔒 Private Inquiries & Consultations
                  </div>
                  <div style={{ fontSize: '1.35rem', color: '#0284c7', lineHeight: 1.5 }}>
                    {user?.role === 'lawyer'
                      ? `Incoming private inquiries from citizens in ${user.city || 'Ethiopia'} seeking legal consultation. You can provide verified private guidance.`
                      : 'Your private inquiries sent to nearby advocates. Review their verified answers and click "Publish to Public Forum" inside any thread to share with the community whenever you wish!'}
                  </div>
                </div>

                {loadingInquiries ? (
                  <div className="loading-state">Loading your inquiries <span className="loading-dots"><span/><span/><span/></span></div>
                ) : privateInquiries.length > 0 ? (
                  <div className="qa-grid" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {privateInquiries.map(q => {
                      const hasLawyer = (q.answers || []).some(a => a.isLawyer);
                      return (
                        <div key={q.id} className="qa-card" onClick={() => setSelectedQuestionId(q.id)} style={{ borderLeft: '4px solid #0284c7' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', gap: '0.6rem' }}>
                            <span className="qa-tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>🔒 {q.category} Law</span>
                            {hasLawyer ? (
                              <span style={{ fontSize: '1.15rem', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', padding: '0.2rem 0.6rem', borderRadius: 99, fontWeight: 700 }}>
                                ✓ Advocate Responded
                              </span>
                            ) : (
                              <span style={{ fontSize: '1.15rem', color: '#b45309', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: 99, fontWeight: 600 }}>
                                ⏳ Pending Response
                              </span>
                            )}
                          </div>
                          <p className="qa-question">{q.title}</p>
                          <p style={{ fontSize: '1.35rem', color: 'var(--gray-700)', lineHeight: 1.45, marginBottom: '1.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {q.description}
                          </p>
                          <div className="qa-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                            <span className="qa-answers">💬 {(q.answers || []).length} responses</span>
                            <span style={{ color: '#0284c7', fontWeight: 600 }}>Click to Review & Publish →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">🔒</span>
                    <p className="empty-title">No private inquiries found</p>
                    <p className="empty-sub">
                      {user?.role === 'lawyer'
                        ? 'No private inquiries currently pending for your practice area in your city.'
                        : 'You have not submitted any private inquiries. Start a private consultation with a nearby advocate!'}
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowAskModal(true)}>
                      Send a Private Legal Inquiry
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════ GUIDES ════════════════════════ */}
      {page === 'guides' && (
        <section className="avvo-section avvo-section-gray" style={{ minHeight:'60vh' }}>
          <div className="container">
            <h1 className="avvo-section-title">Legal Guides & Resources</h1>
            <p className="avvo-section-sub">Plain-language explanations of Ethiopian laws, proclamations, and procedures written by verified advocates.</p>

            {/* Category Filter Chips */}
            <div className="filter-chips" style={{ marginBottom: '2.8rem' }}>
              {['All', 'Criminal Law', 'Family Law', 'Corporate Law', 'Civil & Land Law', 'Labour Law', 'Constitutional Law', 'Intellectual Property', 'Civil Law'].map(cat => (
                <button
                  key={cat}
                  className={`filter-chip${guideCat === cat ? ' active' : ''}`}
                  onClick={() => setGuideCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="guides-grid" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.4rem' }}>
              {GUIDES_DATA
                .filter(g => guideCat === 'All' || g.cat === guideCat)
                .map(g => (
                  <div key={g.id} className="guide-card" onClick={() => setSelectedGuide(g)}>
                    <div className="guide-card-color" style={{ background: g.color }} />
                    <div className="guide-card-body">
                      <div className="guide-cat">{g.cat}</div>
                      <div className="guide-title">{g.title}</div>
                      <p style={{ fontSize: '1.35rem', color: 'var(--gray-700)', lineHeight: 1.5, marginBottom: '1.2rem' }}>
                        {g.subtitle}
                      </p>
                      <div style={{ fontSize: '1.25rem', color: 'var(--gray-500)', borderTop: '1px solid var(--border)', paddingTop: '0.8rem', marginBottom: '1.2rem' }}>
                        <div>✍️ {g.author}</div>
                        <div>📅 {g.updated} · ⏱️ {g.read}</div>
                      </div>
                      <button className="btn btn-primary btn-sm btn-full" style={{ background: g.color || 'var(--orange)' }}>
                        Read Full Guide →
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
        <div>
          {/* Hero */}
          <section className="about-hero">
            <div className="avvo-hero-tag">ABOUT AVVO · LEX-RATING</div>
            <h1>We Make Legal Easier.</h1>
            <p>
              At Avvo, we make legal easier to find, easier to understand, and easier to trust—for everyone. We are the most comprehensive attorney rating and review platform, providing detailed profiles for over 97% of licensed attorneys, hosting one of the largest free legal Q&A forums, and helping millions of people get the legal help and information they need.
            </p>
            <div className="about-hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => setPage('directory')}>Find a Lawyer →</button>
              <button className="btn btn-secondary btn-lg" style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff' }} onClick={() => setPage('qa')}>
                Ask a Free Question
              </button>
            </div>
          </section>

          {/* Avvo by the Numbers */}
          <section className="about-numbers-strip">
            <div className="container">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.6rem' }}>
                Avvo by the Numbers
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '1.5rem', marginBottom: '3.2rem' }}>
                From a bold idea in 2007, Avvo has grown into one of the most comprehensive legal networks, helping millions find the information and legal help they need.
              </p>
              <div className="about-numbers-grid">
                <div>
                  <span className="about-number-val">97%</span>
                  <div className="about-number-title">Of Attorneys Covered</div>
                  <p className="about-number-desc">Comprehensive listings for licensed attorneys nationwide with public verification.</p>
                </div>
                <div>
                  <span className="about-number-val">17M+</span>
                  <div className="about-number-title">Legal Q&As Answered</div>
                  <p className="about-number-desc">Every single answer comes directly from an active, licensed attorney.</p>
                </div>
                <div>
                  <span className="about-number-val">1.1M+</span>
                  <div className="about-number-title">Lawyers in Our Network</div>
                  <p className="about-number-desc">Detailed profiles that make it easy to research, compare, and find the right fit fast.</p>
                </div>
              </div>
            </div>
          </section>

          {/* What is Avvo? */}
          <section className="about-story-section">
            <div className="container" style={{ maxWidth: 860 }}>
              <h2 className="avvo-section-title">What is Avvo?</h2>
              <p style={{ fontSize: '1.6rem', color: 'var(--gray-700)', lineHeight: 1.7, marginBottom: '1.6rem' }}>
                Inspired by the Italian word for lawyer, <strong>“avvocato,”</strong> Avvo launched in 2007 with a bold idea: <em>make finding a lawyer as straightforward as choosing a hotel or doctor online.</em> By 2010, Avvo’s directory profiled over 90% of attorneys nationwide. By 2014, our Q&A forum had surpassed 5 million questions and answers, with a 99% response rate.
              </p>
              <p style={{ fontSize: '1.6rem', color: 'var(--gray-700)', lineHeight: 1.7 }}>
                In 2018, Avvo joined Internet Brands as part of the Martindale-Avvo network, creating one of the largest online legal networks attracting over 25 million monthly consumers. Most recently, our network was recognized in <strong>The National Law Journal's 2026 "Best Of" survey</strong>, winning multiple awards for our attorney rating and legal marketing services.
              </p>

              <div className="about-quote-box">
                “Make finding a lawyer as straightforward as choosing a hotel or doctor online.”
              </div>

              <p style={{ fontSize: '1.5rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>
                Today, Avvo hosts detailed profiles for over 97% of all licensed attorneys—based on national lawyer population registries—and more than 17 million searchable legal questions and answers.
              </p>

              {/* Timeline */}
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, marginTop: '3.6rem', marginBottom: '0.8rem' }}>
                Avvo Timeline
              </h3>
              <div className="about-timeline">
                {[
                  { year: '2007', text: 'Avvo launches with a bold vision for accessible legal help.' },
                  { year: '2010', text: 'Ratings cover 90%+ of attorneys nationwide.' },
                  { year: '2014', text: 'Q&A forum surpasses 5M questions with a 99% response rate.' },
                  { year: '2018', text: 'Joins Internet Brands / Martindale-Avvo network; 25M+ monthly consumers.' },
                  { year: 'Today', text: '97% of all licensed attorneys rated; 17M+ Q&As searchable.' },
                ].map(t => (
                  <div key={t.year} className="timeline-card">
                    <div className="timeline-year">{t.year}</div>
                    <p className="timeline-text">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Four Pillars */}
          <section className="avvo-section avvo-section-white">
            <div className="container">
              <h2 className="avvo-section-title" style={{ textAlign: 'center' }}>Making Legal Easier</h2>
              <p className="avvo-section-sub" style={{ textAlign: 'center' }}>Four tools that connect people with the right legal help</p>

              <div className="about-pillars-grid">
                {/* Pillar 1 */}
                <div className="pillar-card">
                  <div className="pillar-badge">01 · Directory</div>
                  <div className="pillar-title">Attorney Profiles</div>
                  <p className="pillar-desc">
                    Featuring a network of 1.1 million lawyers, our legal directory makes it easy to go from "I think I need a lawyer" to "I found the right one." We bring Avvo Ratings, detailed profiles, and client reviews together in one place, giving consumers the tools to quickly research and compare, and giving attorneys a platform to stand out.
                  </p>
                  <div className="pillar-split">
                    <div className="pillar-for">
                      <strong>For Consumers</strong> Research and compare attorneys quickly.
                    </div>
                    <div className="pillar-for">
                      <strong>For Attorneys</strong> A platform to stand out and attract clients.
                    </div>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="pillar-card">
                  <div className="pillar-badge">02 · Rating System</div>
                  <div className="pillar-title">The Avvo & ELO Rating</div>
                  <p className="pillar-desc">
                    The Rating calculates an objective 1-to-10 score—from "Extreme Caution" to "Superb"—for each attorney based on their experience, education, peer endorsements, and court performance history. For consumers, it delivers an instant snapshot of credentials. For attorneys, it provides an objective mark of credibility.
                  </p>
                  <div className="pillar-split">
                    <div className="pillar-for">
                      <strong>For Consumers</strong> An instant snapshot of a lawyer's credentials.
                    </div>
                    <div className="pillar-for">
                      <strong>For Attorneys</strong> An objective mark of credibility that builds trust.
                    </div>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="pillar-card">
                  <div className="pillar-badge">03 · Verified Reviews</div>
                  <div className="pillar-title">Avvo Reviews</div>
                  <p className="pillar-desc">
                    Avvo Reviews give clients a voice and attorneys a powerful way to build their reputation. In the past year alone, more than 72,000 new attorney reviews were added. Only people who hired or consulted with an attorney can post a review, fake reviews are removed, and genuine client feedback stands.
                  </p>
                  <div className="pillar-split">
                    <div className="pillar-for">
                      <strong>For Consumers</strong> Candid, firsthand client insights.
                    </div>
                    <div className="pillar-for">
                      <strong>For Attorneys</strong> Deepen trust and demonstrate satisfaction.
                    </div>
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className="pillar-card">
                  <div className="pillar-badge">04 · Community Q&A</div>
                  <div className="pillar-title">The Q&A Forum</div>
                  <p className="pillar-desc">
                    Our Q&A Forum gives consumers free, anonymous access to licensed attorneys who speak directly to their situation. Last year, users asked nearly 124,000 new questions and received over 126,000 answers.
                  </p>
                  <div className="pillar-split">
                    <div className="pillar-for">
                      <strong>124K</strong> New questions asked last year
                    </div>
                    <div className="pillar-for">
                      <strong>126K+</strong> Answers provided by licensed attorneys
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How the Rating Works Deep Dive */}
          <div className="about-rating-deepdive">
            <div className="container" style={{ maxWidth: 860 }}>
              <h2>How the Rating Works</h2>
              <p>
                The Rating is calculated by a proprietary model developed with input from attorneys, consumers, and other legal professionals. It draws on two data sources: public records (from state bars, regulatory agencies, Ministry of Justice, and courts) and information attorneys share on their profiles.
              </p>
              <p>
                Each lawyer is evaluated using the same objective criteria—experience, education, professional achievements, peer endorsements, and disciplinary history. Every factor that influences the score is visible on the attorney's profile, and ratings automatically update as new data arrives.
              </p>
              <div className="about-rating-highlight">
                🛡️ <strong>The rating can't be bought:</strong> No manual overrides, no exceptions, and no commercial relationship can change an attorney's score.
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <section className="avvo-section avvo-section-white">
            <div className="container">
              <h2 className="avvo-section-title" style={{ textAlign: 'center' }}>What People Are Saying</h2>
              <p className="avvo-section-sub" style={{ textAlign: 'center' }}>From attorneys building their practice to clients finding the help they need</p>

              <div className="testimonials-grid">
                <div className="testimonial-card">
                  <div>
                    <span className="testimonial-role attorney">Attorney</span>
                    <p className="testimonial-quote">“Avvo is … basically the 'Google' of finding an attorney.”</p>
                  </div>
                  <div className="testimonial-author">— Andrew S. Roberts, Advocate</div>
                </div>

                <div className="testimonial-card">
                  <div>
                    <span className="testimonial-role consumer">Litigant</span>
                    <p className="testimonial-quote">“I actually chose to hire Brian based on the reviews I found on Avvo … at every hearing, Brian showed up extremely well-prepared.”</p>
                  </div>
                  <div className="testimonial-author">— Kevin, Platform User</div>
                </div>

                <div className="testimonial-card">
                  <div>
                    <span className="testimonial-role attorney">Attorney</span>
                    <p className="testimonial-quote">“Leads and referral sources alike rely on our robust online profiles … and more than 500 client ratings and reviews.”</p>
                  </div>
                  <div className="testimonial-author">— Kyle E. Krull, Senior Advocate</div>
                </div>

                <div className="testimonial-card">
                  <div>
                    <span className="testimonial-role consumer">Litigant</span>
                    <p className="testimonial-quote">“[I] found him on Avvo. He has the knowledge and know-how to be a true advocate.”</p>
                  </div>
                  <div className="testimonial-author">— Jackie, Platform User</div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Links & Resources */}
          <section className="about-links-section">
            <div className="about-links-grid">
              <div className="about-link-group">
                <h3>For Consumers</h3>
                <ul>
                  <li><a onClick={() => setPage('directory')}>Find a Lawyer</a></li>
                  <li><a onClick={() => setPage('qa')}>Ask a Free Question</a></li>
                  <li><a onClick={() => setPage('guides')}>Browse Legal Guides & Advice</a></li>
                  <li><a onClick={() => setPage('directory')}>Search by Location</a></li>
                </ul>
              </div>

              <div className="about-link-group">
                <h3>For Attorneys</h3>
                <ul>
                  <li><a onClick={() => setShowAuth(true)}>Claim Your Profile</a></li>
                  <li><a onClick={() => setShowAuth(true)}>Manage Your Profile</a></li>
                  <li><a onClick={() => setPage('qa')}>Answer Legal Questions</a></li>
                  <li><a onClick={() => setShowAuth(true)}>Register with MoJ License</a></li>
                </ul>
              </div>

              <div className="about-link-group">
                <h3>Platform Resources</h3>
                <ul>
                  <li><a onClick={() => setPage('about')}>About Avvo / LEX-RATING</a></li>
                  <li><a onClick={() => setPage('guides')}>Federal Proclamations & Legal Code</a></li>
                  <li><a onClick={() => setPage('about')}>How the ELO Rating Works</a></li>
                  <li><a onClick={() => alert('Support portal: support@lexrating.et')}>Help & Support</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Browse Locations & Practice Areas */}
          <section className="about-browse-strip">
            <div className="about-browse-container">
              <div className="about-browse-block">
                <h4>Popular Locations</h4>
                <div className="about-browse-tags">
                  {ETHIOPIAN_CITIES.map(c => (
                    <span key={c} className="about-browse-tag" onClick={() => { setSearchCity(c); setCityInput(c); fetchLawyers(searchSpec, c); setPage('directory'); }}>
                      {c} Lawyers
                    </span>
                  ))}
                </div>
              </div>

              <div className="about-browse-block">
                <h4>Popular Practice Areas</h4>
                <div className="about-browse-tags">
                  {[
                    'Criminal Defense', 'Corporate & Business', 'Family & Divorce', 'Civil Litigation',
                    'Employment & Labor', 'Immigration Law', 'Estate & Land Rights', 'Personal Injury'
                  ].map(p => (
                    <span key={p} className="about-browse-tag" onClick={() => {
                      const sp = p.split(' ')[0];
                      setSearchSpec(sp); setSpecInput(sp); fetchLawyers(sp, searchCity); setPage('directory');
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
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
  const topAward = lawyer.awards && lawyer.awards.length > 0 ? lawyer.awards[0] : null;

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
          <div className="lawyer-card-spec">{lawyer.specialization} Law</div>
          <div className="lawyer-card-location">📍 {lawyer.city || 'Addis Ababa'}</div>

          {topAward && (
            <div className={`lawyer-award-badge ${topAward.tier ? topAward.tier.toLowerCase() : 'gold'}`}>
              <span>{topAward.icon}</span>
              <span>{topAward.title.length > 30 ? topAward.title.slice(0, 28) + '…' : topAward.title}</span>
            </div>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginTop: '0.4rem' }}>
            <StarRow rating={lawyer.rating} />
            <span style={{ fontSize:'1.2rem', color:'#777' }}>{lawyer.rating.toFixed(1)}</span>
          </div>

          <div className="lawyer-card-meta">
            <span>{lawyer.casesCount} cases</span>
            {lawyer.yearsExperience > 0 && <span>{lawyer.yearsExperience} yrs</span>}
            {lawyer.helpfulVotesReceived > 0 && <span>▲ {lawyer.helpfulVotesReceived} helpful</span>}
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
