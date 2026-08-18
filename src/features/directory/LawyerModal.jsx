import React, { useState, useEffect } from 'react';
import ModalBackdrop from '../../components/common/ModalBackdrop';
import StarRow from '../../components/common/StarRow';
import EloBar from '../../components/common/EloBar';
import { eloToRating } from '../../utils/ratingUtils';

export default function LawyerModal({ lawyer, onClose, onConsult }) {
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!lawyer) return null;

  const avvoRating = eloToRating(lawyer.elo);

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="lawyer-modal" role="dialog" aria-modal="true">
        {/* Hero header */}
        <div className="lawyer-modal-hero">
          <img
            src={lawyer.profilePic}
            alt={lawyer.name}
            className="lawyer-modal-photo"
            onError={e => {
              e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';
            }}
          />
          <div className="lawyer-modal-info">
            <div className="lawyer-modal-name">{lawyer.name}</div>
            <div className="lawyer-modal-spec">
              {lawyer.specialization} Law · {lawyer.yearsExperience > 0 ? `${lawyer.yearsExperience} years exp.` : 'Verified Advocate'}
            </div>
            <div className="lawyer-modal-tags">
              <span className="lawyer-modal-tag">Location: {lawyer.city || 'Ethiopia'}</span>
              <span className="lawyer-modal-tag">License: {lawyer.licenseNumber}</span>
              <span className="lawyer-modal-tag" style={{ background: '#f55d25', border: 'none', fontWeight: 700 }}>
                ELO {lawyer.elo}
              </span>
              <span
                className="lawyer-modal-tag"
                style={{
                  background: avvoRating >= 8 ? '#52a304' : avvoRating >= 6 ? '#8bc34a' : '#fc9835',
                  border: 'none'
                }}
              >
                Rating: {avvoRating} / 10
              </span>
            </div>
          </div>
          <button className="lawyer-modal-close" onClick={onClose} aria-label="Close">X</button>
        </div>

        {/* Tabs */}
        <div className="lawyer-modal-tabs">
          {['overview', 'awards', 'background'].map(t => (
            <button
              key={t}
              className={`lawyer-modal-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'overview' ? 'Overview' : t === 'awards' ? 'Community Activity' : 'Background'}
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
                  <span className="modal-stat-num green">
                    {avvoRating} <span style={{ fontSize: '1.2rem', color: '#777' }}>/ 10</span>
                  </span>
                  <span className="modal-stat-label">Platform Score</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #008cc9' }}>
                  <span className="modal-stat-num blue">{lawyer.casesCount}</span>
                  <span className="modal-stat-label">Cases Handled</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #8b5cf6' }}>
                  <span className="modal-stat-num" style={{ color: '#8b5cf6' }}>
                    {lawyer.yearsExperience > 0 ? `${lawyer.yearsExperience} yrs` : 'Verified'}
                  </span>
                  <span className="modal-stat-label">Experience</span>
                </div>
              </div>

              <EloBar elo={lawyer.elo} />

              {/* Star rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1.2rem 0', fontSize: '1.4rem', color: '#555' }}>
                <StarRow rating={lawyer.rating} />
                <span>{(Number(lawyer.rating) || 0).toFixed(1)} average performance rating (MoJ verified)</span>
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
                  <p className="modal-section-text" style={{ fontWeight: 700 }}>
                    Phone: <a href={`tel:${lawyer.phone}`}>{lawyer.phone}</a>
                  </p>
                </div>
              )}

              <button
                className="modal-contact-btn"
                onClick={() => {
                  if (onConsult) {
                    onClose();
                    onConsult(lawyer);
                  } else {
                    alert('Contact feature requires backend integration.');
                  }
                }}
              >
                Send a Message / Inquiry
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
                  <span className="modal-stat-num green">{lawyer.helpfulVotesReceived || 0}</span>
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
                Community Recognition & Highlights
              </div>

              {lawyer.awards && lawyer.awards.length > 0 ? (
                <div>
                  {lawyer.awards.map((aw, idx) => (
                    <div key={idx} className="award-plaque gold">
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
                <div
                  style={{
                    background: '#f9f9f9',
                    border: '1px dashed var(--border)',
                    borderRadius: 8,
                    padding: '2.4rem',
                    textAlign: 'center',
                    color: 'var(--gray-500)'
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--gray-700)', marginBottom: '0.4rem' }}>
                    Active Legal Contributor
                  </p>
                  <p style={{ fontSize: '1.35rem' }}>
                    Answer citizen legal questions in the Q&A forum and handle cases to build verified community standing.
                  </p>
                </div>
              )}

              <div
                className="modal-section"
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 6,
                  padding: '1.2rem',
                  marginTop: '1.6rem'
                }}
              >
                <div style={{ fontSize: '1.3rem', color: '#166534', fontWeight: 600 }}>
                  Community Impact Program · Recognition granted based on verified public legal answers, citizen helpfulness votes, and courtroom litigation volume.
                </div>
              </div>
            </>
          )}

          {tab === 'background' && (
            <>
              {lawyer.education && (
                <div className="modal-section">
                  <div className="modal-section-title">Education</div>
                  <p className="modal-section-text">{lawyer.education}</p>
                </div>
              )}
              {lawyer.languages && lawyer.languages.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">Languages</div>
                  <div className="lang-pills">
                    {lawyer.languages.map(l => <span key={l} className="lang-pill">{l}</span>)}
                  </div>
                </div>
              )}
              <div className="modal-section">
                <div className="modal-section-title">License & Credentials</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '1.35rem', color: '#555' }}>
                  {[
                    ['License Number', lawyer.licenseNumber],
                    ['Specialization', lawyer.specialization],
                    ['Years of Experience', lawyer.yearsExperience > 0 ? `${lawyer.yearsExperience} years` : 'N/A'],
                    ['City', lawyer.city || 'Addis Ababa'],
                    ['ELO Score', lawyer.elo],
                    ['Platform Rating', `${avvoRating} / 10`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '0.8rem 1rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                        {k}
                      </div>
                      <div style={{ fontWeight: 600, color: '#333' }}>{v || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-section" style={{ background: '#fffbf5', border: '1px solid #ffd09b', borderRadius: 6, padding: '1.2rem' }}>
                <div style={{ fontSize: '1.3rem', color: '#92400e', fontWeight: 600 }}>
                  MoJ Verified · All credentials verified by Ministry of Justice, Ethiopia
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
