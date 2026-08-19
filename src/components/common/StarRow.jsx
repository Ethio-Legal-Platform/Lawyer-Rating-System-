import React from 'react';

export default function StarRow({ rating = 5, max = 5 }) {
  const stars = [];
  const numRating = Number(rating) || 0;

  for (let i = 1; i <= max; i++) {
    if (i <= Math.floor(numRating)) {
      stars.push(<span key={i} className="star-fill">★</span>);
    } else if (i - numRating < 1 && i - numRating > 0) {
      stars.push(<span key={i} className="star-half">★</span>);
    } else {
      stars.push(<span key={i} className="star-empty">☆</span>);
    }
  }

  return <span className="star-row">{stars}</span>;
}
