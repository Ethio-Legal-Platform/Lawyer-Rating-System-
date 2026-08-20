import React from 'react';

export default function GuideCard({ guide, onClick }) {
  return (
    <div
      className="guide-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={`Read guide: ${guide.title}`}
    >
      <div className="guide-card-tag" style={{ color: guide.color || '#008cc9' }}>
        {guide.cat}
      </div>
      <h3 className="guide-card-title">{guide.title}</h3>
      <p className="guide-card-summary">{guide.summary}</p>
      <div className="guide-card-footer">
        <span>Read time: {guide.read}</span>
        <span className="guide-card-link">Read Full Guide &rarr;</span>
      </div>
    </div>
  );
}
