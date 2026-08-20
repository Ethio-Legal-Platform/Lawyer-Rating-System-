import React from 'react';
import StarRow from '../../components/common/StarRow';

export default function LawyerCard({ lawyer, onClick, variant = 'standard' }) {
  return (
    <div
      className={`lawyer-card ${variant === 'horizontal' ? 'lawyer-card-horizontal' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={`View profile and details of ${lawyer.name}`}
    >
      <div className="lawyer-card-main">
        {/* Avatar */}
        <div className="lawyer-card-photo-wrap">
          <img
            src={lawyer.profilePic}
            alt={lawyer.name}
            className="lawyer-card-photo"
            onError={e => {
              e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';
            }}
          />
        </div>

        {/* Info Column */}
        <div className="lawyer-card-body">
          <div className="lawyer-card-header">
            <h3 className="lawyer-card-name">{lawyer.name}</h3>
          </div>

          <div className="lawyer-card-spec">
            {lawyer.specialization} Law Advocate
          </div>

          <div className="lawyer-card-meta">
            <span>Location: {lawyer.city || 'Addis Ababa'}</span>
            <span>·</span>
            <span>Licensed for {lawyer.yearsExperience || 1} years</span>
          </div>

          {variant === 'horizontal' && lawyer.bio && (
            <p className="lawyer-card-bio-snippet">
              {lawyer.bio}
            </p>
          )}

          <div className="lawyer-card-rating">
            {lawyer.showRating === false ? (
              <span className="lawyer-rating-private-badge">🔒 Rating Kept Private</span>
            ) : (
              <>
                <StarRow rating={lawyer.rating} />
                <span className="rating-num">{(Number(lawyer.rating) || 0).toFixed(1)}</span>
              </>
            )}
            <span className="rating-desc">({lawyer.casesCount || 0} court cases)</span>
          </div>
        </div>
      </div>

      {/* Card Action / Score Panel */}
      <div className="lawyer-card-footer">
        {lawyer.showRating === false ? (
          <div className="lawyer-elo-badge private" title="Rating kept private by advocate">
            <span className="lawyer-elo-num">🔒</span>
            <span className="lawyer-elo-label">Rating Private</span>
          </div>
        ) : (
          <div className="lawyer-elo-badge">
            <span className="lawyer-elo-num">{lawyer.elo}</span>
            <span className="lawyer-elo-label">ELO Score</span>
          </div>
        )}
        <button
          className="btn btn-orange btn-sm"
          onClick={e => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Profile &rarr;
        </button>
      </div>
    </div>
  );
}
