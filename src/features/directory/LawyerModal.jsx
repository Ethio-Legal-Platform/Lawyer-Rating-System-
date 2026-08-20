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
              {lawyer.specialization} Law Specialist · {lawyer.yearsExperience > 0 ? `Licensed for ${lawyer.yearsExperience} years` : 'Licensed Advocate'}
            </div>
            <div className="lawyer-modal-tags">
              <span className="lawyer-modal-tag">Jurisdiction: {lawyer.city || 'Ethiopia'}</span>
              <span className="lawyer-modal-tag">
                Licensed for {lawyer.yearsExperience || 1} {lawyer.yearsExperience === 1 ? 'Year' : 'Years'}
              </span>
              {lawyer.showRating === false ? (
                <span className="lawyer-modal-tag" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  🔒 Rating Kept Private
                </span>
              ) : (
                <>
                  <span className="lawyer-modal-tag" style={{ background: 'var(--gold)', color: '#090c10', border: 'none', fontWeight: 800 }}>
                    ELO {lawyer.elo}
                  </span>
                  <span className="lawyer-modal-tag" style={{ background: 'var(--gold-light)', color: 'var(--gold)', border: '1px solid var(--gold-border)', fontWeight: 700 }}>
                    Score: {avvoRating} / 10
                  </span>
                </>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">X</button>
        </div>

        {/* Navigation Tabs */}
        <div className="lawyer-modal-tabs">
          {[
            { id: 'overview', label: 'Overview & Practice' },
            { id: 'background', label: 'Admissions & Background' },
            { id: 'awards', label: 'Recognition & Activity' }
          ].map(t => (
            <button
              key={t.id}
              className={`lawyer-modal-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="lawyer-modal-body">
          {/* TAB 1: OVERVIEW & PRACTICE */}
          {tab === 'overview' && (
            <>
              {/* ELO and Profile Stats */}
              <div className="modal-stats-row">
                {lawyer.showRating === false ? (
                  <div className="modal-stat-box" style={{ borderTop: '3px solid var(--border)', flex: '1 1 200px' }}>
                    <span className="modal-stat-num" style={{ color: 'var(--text-muted)' }}>🔒 Private</span>
                    <span className="modal-stat-label">Courtroom Performance</span>
                  </div>
                ) : (
                  <>
                    <div className="modal-stat-box" style={{ borderTop: '3px solid var(--gold)' }}>
                      <span className="modal-stat-num gold">{lawyer.elo}</span>
                      <span className="modal-stat-label">ELO Rating</span>
                    </div>
                    <div className="modal-stat-box" style={{ borderTop: '3px solid #ffc72c' }}>
                      <span className="modal-stat-num gold">
                        {avvoRating} <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>/ 10</span>
                      </span>
                      <span className="modal-stat-label">Platform Score</span>
                    </div>
                  </>
                )}
                <div className="modal-stat-box" style={{ borderTop: '3px solid var(--blue)' }}>
                  <span className="modal-stat-num blue">{lawyer.casesCount || 0}</span>
                  <span className="modal-stat-label">Court Decisions</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #a855f7' }}>
                  <span className="modal-stat-num" style={{ color: '#a855f7' }}>
                    {lawyer.yearsExperience > 0 ? `${lawyer.yearsExperience} yrs` : 'Active'}
                  </span>
                  <span className="modal-stat-label">Licensed Tenure</span>
                </div>
              </div>

              {lawyer.showRating === false ? (
                <div className="lawyer-modal-privacy-notice" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.2rem 1.6rem', margin: '1.6rem 0', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>🔒</span>
                  <span style={{ fontSize: '1.3rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    This advocate has configured their courtroom ELO performance score to be private in accordance with LEX profile privacy controls.
                  </span>
                </div>
              ) : (
                <>
                  <EloBar elo={lawyer.elo} />
                  {/* Star rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.6rem 0', fontSize: '1.4rem', color: 'var(--text-muted)' }}>
                    <StarRow rating={lawyer.rating} />
                    <span>
                      <strong style={{ color: 'var(--text-white)' }}>{(Number(lawyer.rating) || 0).toFixed(1)}</strong> Performance Rating (Ministry of Justice Registry)
                    </span>
                  </div>
                </>
              )}

              {/* Professional Biography */}
              {lawyer.bio && (
                <div className="modal-section">
                  <div className="modal-section-title">Professional Biography</div>
                  <p className="modal-section-text" style={{ fontSize: '1.5rem', lineHeight: '1.75', color: 'var(--text-main)' }}>
                    {lawyer.bio}
                  </p>
                </div>
              )}

              {/* Practice Areas & Sub-Specialties */}
              {lawyer.practiceAreasDetailed && lawyer.practiceAreasDetailed.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">Key Practice Sub-Specialties</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '0.6rem' }}>
                    {lawyer.practiceAreasDetailed.map((area, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'var(--bg-card-alt)',
                          border: '1px solid var(--gold-border)',
                          color: 'var(--text-white)',
                          fontSize: '1.3rem',
                          fontWeight: 600,
                          padding: '0.5rem 1.2rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Law Office & Consultation Information */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.4rem', marginTop: '1.6rem' }}>
                {lawyer.officeAddress && (
                  <div className="modal-section" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.6rem' }}>
                    <div className="modal-section-title" style={{ fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '0.4rem' }}>
                      Chambers & Office Address
                    </div>
                    <p style={{ fontSize: '1.35rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {lawyer.officeAddress}
                    </p>
                  </div>
                )}

                {lawyer.consultationFee && (
                  <div className="modal-section" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.6rem' }}>
                    <div className="modal-section-title" style={{ fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '0.4rem' }}>
                      Consultation & Engagement
                    </div>
                    <p style={{ fontSize: '1.35rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {lawyer.consultationFee}
                    </p>
                  </div>
                )}
              </div>

              {/* Direct Contact */}
              {lawyer.phone && (
                <div className="modal-section" style={{ marginTop: '1rem' }}>
                  <p className="modal-section-text" style={{ fontWeight: 700, color: 'var(--text-white)' }}>
                    Direct Telephone: <a href={`tel:${lawyer.phone}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>{lawyer.phone}</a>
                    {lawyer.email && (
                      <span style={{ marginLeft: '1.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        Email: <a href={`mailto:${lawyer.email}`} style={{ color: 'var(--text-white)' }}>{lawyer.email}</a>
                      </span>
                    )}
                  </p>
                </div>
              )}

              <button
                className="btn btn-gold btn-lg"
                style={{ width: '100%', marginTop: '1.6rem' }}
                onClick={() => {
                  if (onConsult) {
                    onClose();
                    onConsult(lawyer);
                  }
                }}
              >
                Book Direct Consultation / Inquiry &rarr;
              </button>
            </>
          )}

          {/* TAB 2: ADMISSIONS & BACKGROUND */}
          {tab === 'background' && (
            <>
              {/* Academic Education */}
              {lawyer.education && (
                <div className="modal-section">
                  <div className="modal-section-title">Academic Qualifications & Degrees</div>
                  <div style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)', borderRadius: 'var(--radius-sm)', padding: '1.4rem 1.6rem' }}>
                    <p style={{ fontSize: '1.45rem', color: 'var(--text-white)', fontWeight: 600 }}>
                      {lawyer.education}
                    </p>
                  </div>
                </div>
              )}

              {/* Courtroom Admissions */}
              {lawyer.courtAdmissions && lawyer.courtAdmissions.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">Court Admissions & Benches</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {lawyer.courtAdmissions.map((court, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-card-alt)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem 1.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        <span style={{ color: 'var(--gold)', fontWeight: 800 }}>•</span>
                        <span style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 600 }}>{court}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Memberships */}
              {lawyer.associationMemberships && lawyer.associationMemberships.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">Bar Association Memberships</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {lawyer.associationMemberships.map((assoc, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--border-strong)',
                          color: 'var(--text-white)',
                          fontSize: '1.3rem',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        {assoc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages Spoken */}
              {lawyer.languages && lawyer.languages.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">Languages Spoken</div>
                  <div className="lang-pills">
                    {lawyer.languages.map(l => (
                      <span key={l} className="lang-pill">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Credentials Summary */}
              <div className="modal-section">
                <div className="modal-section-title">Ministry of Justice Registration Record</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', fontSize: '1.35rem' }}>
                  {[
                    ['Licensing Authority', 'Ministry of Justice, Ethiopia'],
                    ['Practice Status', 'Active Advocate in Good Standing'],
                    ['Primary Specialization', `${lawyer.specialization} Law`],
                    ['Licensing Tenure', lawyer.yearsExperience > 0 ? `Licensed for ${lawyer.yearsExperience} years` : 'Licensed Advocate'],
                    ['Regional Jurisdiction', lawyer.city || 'Addis Ababa'],
                    ['Algorithmic ELO Rating', lawyer.elo],
                    ['Quality Score', `${avvoRating} / 10`]
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.2rem 1.4rem' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                        {k}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--text-white)', fontSize: '1.4rem' }}>{v || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: AWARDS & ACTIVITY */}
          {tab === 'awards' && (
            <>
              <div className="modal-stats-row" style={{ marginBottom: '2.4rem' }}>
                <div className="modal-stat-box" style={{ borderTop: '3px solid var(--gold)' }}>
                  <span className="modal-stat-num gold">{lawyer.interactionScore || 45}</span>
                  <span className="modal-stat-label">Activity Points</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid var(--gold)' }}>
                  <span className="modal-stat-num gold">
                    {lawyer.helpfulVotesReceived || 14}
                  </span>
                  <span className="modal-stat-label">Helpful Upvotes</span>
                </div>
                <div className="modal-stat-box" style={{ borderTop: '3px solid #a855f7' }}>
                  <span className="modal-stat-num" style={{ color: '#a855f7' }}>
                    {lawyer.interactionRank ? `#${lawyer.interactionRank}` : 'Top 10'}
                  </span>
                  <span className="modal-stat-label">National Rank</span>
                </div>
              </div>

              <div className="modal-section-title" style={{ marginBottom: '1.4rem' }}>
                Community Recognition & Badges
              </div>

              {lawyer.awards && lawyer.awards.length > 0 ? (
                <div>
                  {lawyer.awards.map((aw, idx) => (
                    <div key={idx} className="award-plaque gold">
                      <div style={{ flex: 1 }}>
                        <span className="award-tier-tag">
                          {aw.tier || 'Verified Tier'}
                        </span>
                        <div className="award-plaque-title">{aw.title}</div>
                        <div className="award-plaque-desc">{aw.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="award-plaque gold">
                  <div style={{ flex: 1 }}>
                    <span className="award-tier-tag">Ministry of Justice</span>
                    <div className="award-plaque-title">Certified Legal Practitioner</div>
                    <div className="award-plaque-desc">
                      Recognized for active courtroom litigation, procedural diligence, and professional client representation.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
