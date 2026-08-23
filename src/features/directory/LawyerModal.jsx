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

  const avvoRating = eloToRating(lawyer.elo || 1200);
  const ratingScore = (Number(lawyer.rating) || 4.8).toFixed(1);
  const reviewsCount = lawyer.reviewsCount || lawyer.casesCount || 128;
  const yearsExp = lawyer.yearsExperience || 8;
  const casesHandled = lawyer.casesCount || 156;

  const mockReviews = [
    {
      id: 1,
      name: 'Abebe Ketema',
      date: 'May 12, 2024',
      rating: 5,
      comment: 'He handled my case with professionalism and dedication. Highly recommended!'
    },
    {
      id: 2,
      name: 'Selamawit D.',
      date: 'Apr 28, 2024',
      rating: 5,
      comment: 'Great communication and explains everything clearly. Very satisfied.'
    },
    {
      id: 3,
      name: 'Yonas Berhanu',
      date: 'Mar 15, 2024',
      rating: 5,
      comment: 'Excellent lawyer! Got the best possible outcome. Thank you!'
    }
  ];

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="lex-lawyer-drawer" role="dialog" aria-modal="true">
        {/* Top Close Action */}
        <button className="lex-drawer-close" onClick={onClose} aria-label="Close modal">×</button>

        {/* Hero Banner Header */}
        <div className="lex-drawer-header">
          <div className="lex-drawer-avatar-wrap">
            <img
              src={lawyer.profilePic || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'}
              alt={lawyer.name}
              className="lex-drawer-avatar"
              onError={e => {
                e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';
              }}
            />
          </div>

          <div className="lex-drawer-header-info">
            <h2 className="lex-drawer-name">
              {lawyer.name}
              <span className="lex-verified-badge" title="Verified MoJ License">✓</span>
            </h2>
            <p className="lex-drawer-sub">
              {lawyer.specialization} Law Advocate • {yearsExp > 0 ? `${yearsExp} Years Experience` : 'Licensed Advocate'}
            </p>
            <p className="lex-drawer-meta">
              <span>📍 {lawyer.city || 'Addis Ababa'}, Ethiopia</span>
              <span className="lex-dot">•</span>
              <span>Speaks: {lawyer.languages ? lawyer.languages.join(', ') : 'Amharic, English'}</span>
            </p>

            <div className="lex-drawer-actions">
              <button
                type="button"
                className="lex-btn-contact"
                onClick={() => {
                  if (onConsult) {
                    onClose();
                    onConsult(lawyer);
                  }
                }}
              >
                Contact Lawyer
              </button>
              <button type="button" className="lex-btn-save">
                ♡ Save
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="lex-drawer-stats-row">
          <div className="lex-stat-box">
            {lawyer.showRating === false ? (
              <span className="lex-stat-score-private">🔒 Private</span>
            ) : (
              <>
                <div className="lex-stat-score-wrap">
                  <span className="lex-stat-score">{ratingScore}</span>
                </div>
                <div className="lex-stat-stars">★★★★★</div>
                <span className="lex-stat-sub">({reviewsCount} reviews)</span>
              </>
            )}
          </div>

          <div className="lex-stat-box">
            <span className="lex-stat-val">
              {lawyer.showRating === false ? '🔒' : `ELO ${lawyer.elo || 1200}`}
            </span>
            <span className="lex-stat-lbl">Courtroom ELO Rating</span>
          </div>

          <div className="lex-stat-box">
            <span className="lex-stat-val">{casesHandled}</span>
            <span className="lex-stat-lbl">Cases Handled</span>
          </div>

          <div className="lex-stat-box">
            <span className="lex-stat-val">{yearsExp}</span>
            <span className="lex-stat-lbl">Years Experience</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="lex-drawer-tabs">
          {[
            { id: 'overview', label: 'Overview & Practice' },
            { id: 'background', label: 'Admissions & Background' },
            { id: 'awards', label: 'Recognition & Activity' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              className={`lex-drawer-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main Body Content */}
        <div className="lex-drawer-body">
          {/* TAB 1: OVERVIEW & PRACTICE */}
          {tab === 'overview' && (
            <>
              {/* ELO Bar & Rating Status */}
              {lawyer.showRating === false ? (
                <div className="lex-privacy-notice-box">
                  <span>🔒</span>
                  <span>This advocate has configured their courtroom ELO performance score to be private in accordance with LEX profile privacy controls.</span>
                </div>
              ) : (
                <div className="lex-elo-section">
                  <EloBar elo={lawyer.elo || 1200} />
                  <div className="lex-elo-details-row">
                    <span>Algorithmic ELO: <strong>{lawyer.elo || 1200}</strong></span>
                    <span>Platform Score: <strong>{avvoRating} / 10</strong></span>
                    <span>Verified Cases: <strong>{casesHandled}</strong></span>
                  </div>
                </div>
              )}

              {/* About & Verification Grid */}
              <div className="lex-about-grid">
                <div className="lex-about-left">
                  <h3 className="lex-section-heading">About</h3>
                  <p className="lex-about-text">
                    {lawyer.bio || `${lawyer.name} is an experienced defense and litigation attorney based in ${lawyer.city || 'Addis Ababa'} with over ${yearsExp} years of practice experience. Committed to providing strong legal representation and protecting clients' rights.`}
                  </p>

                  {/* Practice Areas Badges */}
                  <h4 className="lex-sub-heading">Practice Areas</h4>
                  <div className="lex-pills-row">
                    <span className="lex-pill">{lawyer.specialization} Law</span>
                    {lawyer.practiceAreasDetailed && lawyer.practiceAreasDetailed.length > 0 ? (
                      lawyer.practiceAreasDetailed.map((a, i) => (
                        <span key={i} className="lex-pill">{a}</span>
                      ))
                    ) : (
                      <>
                        <span className="lex-pill">Civil Law</span>
                        <span className="lex-pill">Human Rights</span>
                        <span className="lex-pill">Constitutional Law</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="lex-about-right">
                  <ul className="lex-check-list">
                    <li>
                      <span className="lex-check-icon">✓</span>
                      <span>License Verified (MoJ)</span>
                    </li>
                    <li>
                      <span className="lex-check-icon">✓</span>
                      <span>Member of ELSA</span>
                    </li>
                    <li>
                      <span className="lex-check-icon">✓</span>
                      <span>Graduated from {lawyer.education || 'AAU Law School'}</span>
                    </li>
                    <li className="lex-lang-row">
                      <span className="lex-list-label">Languages</span>
                      <span className="lex-list-val">{lawyer.languages ? lawyer.languages.join(', ') : 'Amharic, English'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Office & Consultation Details */}
              <div className="lex-contact-details-grid">
                {lawyer.officeAddress && (
                  <div className="lex-info-card">
                    <h5 className="lex-info-card-title">Chambers & Office Address</h5>
                    <p>{lawyer.officeAddress}</p>
                  </div>
                )}
                {lawyer.consultationFee && (
                  <div className="lex-info-card">
                    <h5 className="lex-info-card-title">Consultation & Fees</h5>
                    <p>{lawyer.consultationFee}</p>
                  </div>
                )}
                {lawyer.phone && (
                  <div className="lex-info-card">
                    <h5 className="lex-info-card-title">Direct Contact</h5>
                    <p>Phone: <a href={`tel:${lawyer.phone}`}>{lawyer.phone}</a></p>
                    {lawyer.email && <p>Email: <a href={`mailto:${lawyer.email}`}>{lawyer.email}</a></p>}
                  </div>
                )}
              </div>

              {/* Book Direct Consultation Action */}
              <button
                type="button"
                className="lex-btn-dark-full lex-btn-consult-lg"
                onClick={() => {
                  if (onConsult) {
                    onClose();
                    onConsult(lawyer);
                  }
                }}
              >
                Book Direct Consultation / Inquiry →
              </button>

              {/* Client Reviews Section */}
              <div className="lex-reviews-section">
                <div className="lex-reviews-header">
                  <h3 className="lex-section-heading">Client Reviews ({reviewsCount})</h3>
                  <button 
                    type="button" 
                    className="lex-btn-write-review"
                    onClick={() => {
                      if (onConsult) {
                        onClose();
                        onConsult(lawyer);
                      }
                    }}
                  >
                    Write a Review
                  </button>
                </div>

                <div className="lex-reviews-list">
                  {mockReviews.map(r => (
                    <div key={r.id} className="lex-review-card">
                      <div className="lex-review-avatar">
                        {r.name.charAt(0)}
                      </div>
                      <div className="lex-review-body">
                        <div className="lex-review-top">
                          <h4 className="lex-reviewer-name">{r.name}</h4>
                          <span className="lex-review-date">{r.date}</span>
                        </div>
                        <div className="lex-review-stars">★★★★★</div>
                        <p className="lex-review-text">{r.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lex-view-all-reviews">
                  <button type="button" className="lex-link-btn" onClick={onClose}>
                    View All Reviews →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ADMISSIONS & BACKGROUND */}
          {tab === 'background' && (
            <div className="lex-tab-content">
              {lawyer.education && (
                <div className="lex-info-card">
                  <h5 className="lex-info-card-title">Academic Qualifications</h5>
                  <p>{lawyer.education}</p>
                </div>
              )}

              {lawyer.courtAdmissions && lawyer.courtAdmissions.length > 0 && (
                <div className="lex-info-card">
                  <h5 className="lex-info-card-title">Court Admissions & Benches</h5>
                  <ul className="lex-simple-list">
                    {lawyer.courtAdmissions.map((court, idx) => (
                      <li key={idx}>• {court}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lawyer.associationMemberships && lawyer.associationMemberships.length > 0 && (
                <div className="lex-info-card">
                  <h5 className="lex-info-card-title">Bar Association Memberships</h5>
                  <div className="lex-pills-row">
                    {lawyer.associationMemberships.map((assoc, idx) => (
                      <span key={idx} className="lex-pill">{assoc}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="lex-info-card">
                <h5 className="lex-info-card-title">Ministry of Justice Registry Record</h5>
                <div className="lex-registry-table">
                  <div><span>Licensing Authority</span><strong>Ministry of Justice, Ethiopia</strong></div>
                  <div><span>Practice Status</span><strong>Active Advocate in Good Standing</strong></div>
                  <div><span>Primary Specialization</span><strong>{lawyer.specialization} Law</strong></div>
                  <div><span>Licensing Tenure</span><strong>{yearsExp} Years Licensed</strong></div>
                  <div><span>Regional Jurisdiction</span><strong>{lawyer.city || 'Addis Ababa'}</strong></div>
                  <div><span>Algorithmic ELO</span><strong>{lawyer.elo || 1200}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECOGNITION & ACTIVITY */}
          {tab === 'awards' && (
            <div className="lex-tab-content">
              <div className="lex-drawer-stats-row" style={{ marginBottom: '2rem', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                <div className="lex-stat-box">
                  <span className="lex-stat-val">{lawyer.interactionScore || 45}</span>
                  <span className="lex-stat-lbl">Activity Points</span>
                </div>
                <div className="lex-stat-box">
                  <span className="lex-stat-val">{lawyer.helpfulVotesReceived || 14}</span>
                  <span className="lex-stat-lbl">Helpful Upvotes</span>
                </div>
                <div className="lex-stat-box">
                  <span className="lex-stat-val">{lawyer.interactionRank ? `#${lawyer.interactionRank}` : 'Top 10'}</span>
                  <span className="lex-stat-lbl">National Rank</span>
                </div>
              </div>

              <h4 className="lex-sub-heading">Community Recognition & Badges</h4>
              <div className="lex-info-card">
                <h5 className="lex-info-card-title">Ministry of Justice Certified</h5>
                <p>Recognized for active courtroom litigation, procedural diligence, and professional client representation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
