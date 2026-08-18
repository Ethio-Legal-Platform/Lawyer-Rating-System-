import React from 'react';
import StarRow from '../../components/common/StarRow';
import { eloToRating, ratingColor } from '../../utils/ratingUtils';

export default function LawyerCard({ lawyer, onClick }) {
  const avvoRating = eloToRating(lawyer.elo);
  const ratingClass = ratingColor(avvoRating);

  return (
    <div
      className="lawyer-card lawyer-card-compact"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={`View full details of ${lawyer.name}`}
    >
      <div className="lawyer-card-compact-header">
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

        <div className="lawyer-card-compact-info">
          <div className="lawyer-card-name-row">
            <h3 className="lawyer-card-name">{lawyer.name}</h3>
            <span className="verified-badge">Verified</span>
          </div>

          <div className="lawyer-card-spec">
            {lawyer.specialization} Law · {lawyer.city || 'Addis Ababa'}
          </div>

          <div className="lawyer-card-rating-mini">
            <StarRow rating={lawyer.rating} />
            <span className="rating-num">{(Number(lawyer.rating) || 0).toFixed(1)}</span>
            <span className="rating-cases">({lawyer.casesCount || 0} cases)</span>
          </div>
        </div>
      </div>

      <div className="lawyer-card-compact-footer">
        <div className="lawyer-elo-mini">
          <span className="lawyer-elo-label">ELO</span>
          <span className="lawyer-elo-val">{lawyer.elo}</span>
        </div>
        <span className="lawyer-card-expand-btn">
          View Details &rarr;
        </span>
      </div>
    </div>
  );
}
