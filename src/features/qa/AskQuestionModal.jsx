import React, { useState, useEffect } from 'react';
import ModalBackdrop from '../../components/common/ModalBackdrop';
import { api } from '../../services/api';
import { ETHIOPIAN_CITIES, SPECIALIZATION_LIST } from '../../data/constants';

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
      <div className="auth-modal" style={{ maxWidth: 640 }} role="dialog" aria-modal="true">
        <div className="auth-modal-header">
          <div className="auth-modal-title">
            {initialLawyer ? `Inquiry for ${initialLawyer.name}` : 'Ask a Legal Question'}
          </div>
          <div className="auth-modal-sub">
            Connect with Ministry of Justice verified advocates in Ethiopia
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">X</button>
        </div>

        <div className="auth-body" style={{ padding: '2.8rem' }}>
          {error && <div className="alert alert-error" style={{ marginBottom: '1.6rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Privacy Mode Selector */}
            <div className="form-group" style={{ background: '#0e131b', border: '1px solid var(--border)', borderRadius: 8, padding: '1.6rem', marginBottom: '2rem' }}>
              <label className="form-label" style={{ marginBottom: '1rem', fontWeight: 800, color: 'var(--gold)' }}>
                Inquiry Visibility Mode
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    style={{ accentColor: '#fdb813', marginTop: '0.3rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.45rem', color: 'var(--text-white)' }}>Public Legal Q&A</div>
                    <div style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Visible on the community forum so verified advocates and litigants can discuss publicly.
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    style={{ accentColor: '#fdb813', marginTop: '0.3rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.45rem', color: 'var(--blue)' }}>
                      Private Consultation (Direct to Advocates)
                    </div>
                    <div style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Sent privately to verified advocates in {city}. You can review responses and publish anytime!
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
                placeholder="e.g. Can my landlord increase rent without notice under federal law?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4rem' }}>
              <div className="form-group">
                <label className="form-label">Legal Category *</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {SPECIALIZATION_LIST.map(c => (
                    <option key={c} value={c}>{c} Law</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City Jurisdiction *</label>
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
                rows={5}
                placeholder="Describe your situation in detail: What occurred, what contracts/documents exist, and what legal clarification do you require?"
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
                {isPrivate ? 'Private consultation sent directly to verified advocates.' : 'Public inquiry visible on the community legal forum.'}
              </p>
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '1rem', padding: '1.3rem' }} disabled={loading}>
              {loading
                ? 'Submitting…'
                : isPrivate
                  ? 'Send Private Inquiry to Advocates'
                  : 'Submit Question to Public Forum'}
            </button>
          </form>
        </div>
      </div>
    </ModalBackdrop>
  );
}
