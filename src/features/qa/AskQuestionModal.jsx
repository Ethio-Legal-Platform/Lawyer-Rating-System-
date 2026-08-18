import React, { useState, useEffect } from 'react';
import ModalBackdrop from '../../components/common/ModalBackdrop';
import { api } from '../../services/api';
import { ETHIOPIAN_CITIES } from '../../data/constants';

export default function AskQuestionModal({ currentUser, onClose, onQuestionCreated, initialLawyer = null }) {
  const [title, setTitle] = useState(initialLawyer ? `Legal Inquiry for ${initialLawyer.name}` : '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialLawyer?.specialization || 'Criminal');
  const [city, setCity] = useState(initialLawyer?.city || currentUser?.city || 'Addis Ababa');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [isPrivate, setIsPrivate] = useState(Boolean(initialLawyer));
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
        isPrivate: Boolean(isPrivate),
        targetLawyerId: initialLawyer?.id || null
      };

      const { ok, data } = await api.createQuestion(payload);
      if (ok) {
        if (onQuestionCreated) onQuestionCreated(data.question);
        onClose();
      } else {
        setError(data.error || 'Failed to submit question.');
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="auth-modal" style={{ maxWidth: 620 }} role="dialog" aria-modal="true">
        <div className="auth-modal-header">
          <div className="auth-modal-title">
            {initialLawyer ? `Inquiry for ${initialLawyer.name}` : 'Ask a Legal Question'}
          </div>
          <div className="auth-modal-sub">
            Connect with Ministry of Justice verified advocates in Ethiopia
          </div>
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
                  <input
                    type="radio"
                    name="privacy"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    style={{ accentColor: '#f55d25', marginTop: '0.3rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--gray-900)' }}>🌐 Public Legal Q&A</div>
                    <div style={{ fontSize: '1.25rem', color: 'var(--gray-500)' }}>
                      Visible on the community forum so verified advocates and litigants can discuss publicly.
                    </div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    style={{ accentColor: '#f55d25', marginTop: '0.3rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.4rem', color: '#008cc9' }}>
                      🔒 Private Inquiry (Nearby Advocate First)
                    </div>
                    <div style={{ fontSize: '1.25rem', color: 'var(--gray-500)' }}>
                      Sent privately to verified advocates in {city}. You can review their answer and publish to the public forum with 1 click anytime!
                    </div>
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
              {loading
                ? <span className="loading-spinner" />
                : isPrivate
                  ? 'Send Private Inquiry to Nearby Advocates'
                  : 'Submit Question to Public Forum'}
            </button>
          </form>
        </div>
      </div>
    </ModalBackdrop>
  );
}
