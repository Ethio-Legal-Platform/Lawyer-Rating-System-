import React from 'react';
import StarRow from '../../components/common/StarRow';

export default function LawyerCard({ lawyer, onClick, variant = 'standard' }) {
  const ratingVal = (Number(lawyer.rating) || 4.8).toFixed(1);
  const reviewsCount = lawyer.reviewsCount || lawyer.casesCount || 128;
  const casesCount = lawyer.casesCount || 128;
  const yearsExp = lawyer.yearsExperience || 1;

  return (
    <div
      className={`lex-lawyer-card ${variant === 'horizontal' ? 'lex-lawyer-card-horizontal' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={`View profile and details of ${lawyer.name}`}
    >
      {/* Bookmark Icon */}
      <button 
        type="button" 
        className="lex-bookmark-btn" 
        onClick={(e) => { e.stopPropagation(); }}
        title="Bookmark lawyer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Headshot Avatar */}
      <div className="lex-card-avatar-wrap">
        <img
          src={lawyer.profilePic || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'}
          alt={lawyer.name}
          className="lex-card-avatar"
          onError={e => {
            e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200';
          }}
        />
      </div>

      {/* Content Body */}
      <div className="lex-card-content">
        <h3 className="lex-card-name">{lawyer.name}</h3>
        <p className="lex-card-spec">{lawyer.specialization} Law Advocate</p>

        {/* ELO Rating Badge */}
        <div className="lex-card-elo-row">
          {lawyer.showRating === false ? (
            <span className="lex-elo-badge private" title="Rating kept private">
              Rating Private
            </span>
          ) : (
            <span className="lex-elo-badge">
              ELO {lawyer.elo || 1200}
            </span>
          )}
          <span className="lex-card-tenure">Licensed for {yearsExp} {yearsExp === 1 ? 'yr' : 'yrs'}</span>
        </div>

        {/* Star Rating Row */}
        <div className="lex-card-rating-row">
          {lawyer.showRating === false ? (
            <span className="lex-rating-private-text">Rating Kept Private</span>
          ) : (
            <>
              <StarRow rating={lawyer.rating} />
              <span className="lex-rating-score">{ratingVal}</span>
              <span className="lex-reviews-count">({reviewsCount} reviews)</span>
            </>
          )}
        </div>

        <p className="lex-card-cases">Cases Handled: {casesCount} court decisions</p>
        <p className="lex-card-location">Location: {lawyer.city || 'Addis Ababa'}</p>

        {variant === 'horizontal' && lawyer.bio && (
          <p className="lex-card-bio-snippet">{lawyer.bio}</p>
        )}
      </div>

      {/* View Profile Action */}
      <button
        type="button"
        className="lex-btn-dark-full"
        onClick={e => {
          e.stopPropagation();
          onClick();
        }}
      >
        View Profile
      </button>
    </div>
  );
}
