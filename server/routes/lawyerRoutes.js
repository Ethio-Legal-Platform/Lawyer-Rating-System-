import { Router } from 'express';
import { readJSON } from '../lib/db.js';
import { USERS_PATH, COURT_CASES_PATH } from '../config/paths.js';
import { calculateLawyerRatings } from '../services/ratingService.js';

const router = Router();

// ── GET /api/lawyers/search ────────────────────────────────────────────────
// Optional query params:
//   ?specialization=Criminal
//   ?city=Addis%20Ababa
// Both can be combined. Results sorted by ELO descending.
router.get('/search', (req, res) => {
  const specQuery = (req.query.specialization || '').toLowerCase().trim();
  const cityQuery = (req.query.city         || '').toLowerCase().trim();

  const users      = readJSON(USERS_PATH);
  const courtCases = readJSON(COURT_CASES_PATH);

  const { eloMap, statsMap } = calculateLawyerRatings(users, courtCases);

  const matchingLawyers = users.filter(u => {
    if (u.role !== 'lawyer' || !u.verified) return false;
    if (specQuery && !(u.specialization || '').toLowerCase().includes(specQuery)) return false;
    if (cityQuery && !(u.city          || '').toLowerCase().includes(cityQuery)) return false;
    return true;
  });

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
      city:           l.city           || 'Addis Ababa',
      phone:          l.phone          || '',
      bio:            l.bio            || '',
      yearsExperience: l.yearsExperience || 0,
      education:      l.education      || '',
      languages:      l.languages      || [],
      profilePic:     l.profilePic     || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
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
