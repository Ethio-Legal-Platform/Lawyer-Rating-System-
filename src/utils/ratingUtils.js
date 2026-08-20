export function eloToRating(elo) {
  if (!elo) return 5.0;
  const clamped = Math.min(Math.max(elo, 800), 1600);
  return +(1 + ((clamped - 800) / 800) * 9).toFixed(1);
}

export function ratingColor(r) {
  if (r >= 9.0) return 'rating-superb';
  if (r >= 7.5) return 'rating-excellent';
  if (r >= 6.0) return 'rating-good';
  return 'rating-fair';
}
