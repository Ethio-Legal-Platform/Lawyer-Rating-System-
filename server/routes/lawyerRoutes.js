import { Router } from 'express';
import { readJSON } from '../lib/db.js';
import { USERS_PATH, COURT_CASES_PATH } from '../config/paths.js';
import { calculateLawyerRatings } from '../services/ratingService.js';

const router = Router();

// ── GET /api/lawyers/search ────────────────────────────────────────────────
// Searches verified lawyers by specialization (optional) and returns each one
// enriched with their real-time ELO score and performance statistics.
// Results are sorted by ELO descending.
router.get('/search', (req, res) => {
  const query      = (req.query.specialization || '').toLowerCase().trim();
  const users      = readJSON(USERS_PATH);
  const courtCases = readJSON(COURT_CASES_PATH);

  const { eloMap, statsMap } = calculateLawyerRatings(users, courtCases);

  const matchingLawyers = users.filter(u =>
    u.role === 'lawyer' &&
    u.verified === true &&
    (query === '' || (u.specialization && u.specialization.toLowerCase().includes(query)))
  );

  const results = matchingLawyers.map(l => {
    const elo   = eloMap[l.licenseNumber]   || 1000;
    const stats = statsMap[l.licenseNumber] || { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };

    const rating = stats.ratings.length > 0
      ? parseFloat((stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1))
      : 5.0;

    return {
      id:             l.id,
      name:           l.name,
      specialization: l.specialization,
      licenseNumber:  l.licenseNumber,
      profilePic:     l.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      elo,
      rating,
      casesCount: stats.totalCases,
      casesWon:   stats.casesWon,
      casesLost:  stats.casesLost
    };
  });

  results.sort((a, b) => b.elo - a.elo);

  res.json(results);
});

export default router;
