import React from 'react';
import StarRow from '../../components/common/StarRow';
import { eloToRating, ratingColor } from '../../utils/ratingUtils';

export default function LawyerCard({ lawyer, onClick }) {
  const avvoRating = eloToRating(lawyer.elo);
  const ratingClass = ratingColor(avvoRating);
  const topAward = lawyer.awards && lawyer.awards.length > 0 ? lawyer.awards[0] : null;

  return (
    <div
      className="lawyer-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={`View profile of ${lawyer.name}`}
    >
      <div className="lawyer-card-inner">
        <div className="lawyer-card-photo-wrap">
          <img
            src={lawyer.profilePic}
            alt={lawyer.name}
            className="lawyer-card-photo"
            onError={e => {
              e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';
            }}
          />
          <div className={`avvo-rating-badge ${ratingClass}`}>{avvoRating}</div>
        </div>

        <div className="lawyer-card-body">
          <div className="lawyer-card-header">
            <h3 className="lawyer-card-name">{lawyer.name}</h3>
            <span className="verified-badge">✓ MoJ Verified</span>
          </div>

          <div className="lawyer-card-spec">
            {lawyer.specialization} Law · {lawyer.yearsExperience > 0 ? `${lawyer.yearsExperience} yrs exp.` : 'Licensed Advocate'}
          </div>

          <div className="lawyer-card-meta">
            <span>📍 {lawyer.city || 'Addis Ababa'}</span>
            <span>🔖 {lawyer.licenseNumber}</span>
            <span style={{ color: '#008cc9', fontWeight: 600 }}>{lawyer.casesCount} Decided Cases</span>
            {lawyer.interactionScore > 0 && (
              <span style={{ color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                ⭐ {lawyer.interactionScore} Activity
              </span>
            )}
          </div>

          {topAward && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 4,
                padding: '0.2rem 0.6rem',
                fontSize: '1.2rem',
                color: '#92400e',
                fontWeight: 700,
                marginTop: '0.4rem'
              }}
            >
              <span>{topAward.icon}</span>
              <span>{topAward.title}</span>
            </div>
          )}

          <div className="lawyer-card-rating">
            <StarRow rating={lawyer.rating} />
            <span className="rating-num">{(Number(lawyer.rating) || 0).toFixed(1)}</span>
            <span className="rating-desc">({lawyer.casesCount} court reviews)</span>
          </div>

          {lawyer.bio && <p className="lawyer-card-bio">{lawyer.bio}</p>}
        </div>

        <div className="lawyer-card-action">
          <div className="lawyer-elo-badge">
            <span className="lawyer-elo-num">{lawyer.elo}</span>
            <span className="lawyer-elo-label">ELO Score</span>
          </div>
          <button
            className="btn btn-orange btn-sm"
            onClick={e => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
