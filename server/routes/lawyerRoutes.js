import { Router } from 'express';
import { readJSON } from '../lib/db.js';
import { USERS_PATH, COURT_CASES_PATH } from '../config/paths.js';
import { calculateLawyerRatings } from '../services/ratingService.js';
import { calculateLawyerInteractions } from '../services/interactionService.js';

const router = Router();

// ── GET /api/lawyers/leaderboard ───────────────────────────────────────────
// Returns ranked list of most interactive advocates with award honors
router.get('/leaderboard', (req, res) => {
  try {
    const { rankedList } = calculateLawyerInteractions();
    res.json(rankedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/lawyers/search ────────────────────────────────────────────────
// Optional query params:
//   ?specialization=Criminal
//   ?city=Addis%20Ababa
//   ?search=Kebede  or  ?q=Family
// Results sorted by ELO descending.
router.get('/search', (req, res) => {
  const specQuery   = (req.query.specialization || '').toLowerCase().trim();
  const cityQuery   = (req.query.city           || '').toLowerCase().trim();
  const searchQuery = (req.query.search || req.query.q || '').toLowerCase().trim();

  const users      = readJSON(USERS_PATH);
  const courtCases = readJSON(COURT_CASES_PATH);

  const { eloMap, statsMap } = calculateLawyerRatings(users, courtCases);
  const { interactionMap }   = calculateLawyerInteractions();

  const matchingLawyers = users.filter(u => {
    if (u.role !== 'lawyer' || !u.verified) return false;

    const uSpec = (u.specialization || '').toLowerCase();
    const uCity = (u.city           || '').toLowerCase();
    const uName = (u.name || u.fullName || '').toLowerCase();
    const uBio  = (u.bio            || '').toLowerCase();
    const uLic  = (u.licenseNumber  || '').toLowerCase();

    // Check specialization matching (bidirectional: "Criminal" matches "Criminal Defense" and vice versa)
    if (specQuery) {
      const match = uSpec.includes(specQuery) || specQuery.includes(uSpec);
      if (!match) return false;
    }

    // Check city matching
    if (cityQuery) {
      const match = uCity.includes(cityQuery) || cityQuery.includes(uCity);
      if (!match) return false;
    }

    // Check generic search keyword
    if (searchQuery) {
      const match = uName.includes(searchQuery) ||
                    uSpec.includes(searchQuery) ||
                    searchQuery.includes(uSpec) ||
                    uCity.includes(searchQuery) ||
                    uBio.includes(searchQuery) ||
                    uLic.includes(searchQuery);
      if (!match) return false;
    }

    return true;
  });

  const results = matchingLawyers.map(l => {
    const elo   = eloMap[l.licenseNumber]   || 1000;
    const stats = statsMap[l.licenseNumber] || { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };
    const inter = interactionMap[l.id] || interactionMap[l.licenseNumber] || {
      qaAnswersCount: 0,
      helpfulVotesReceived: 0,
      interactionScore: 0,
      interactionRank: 99,
      awards: []
    };

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
      casesCount:           stats.totalCases,
      casesWon:             stats.casesWon,
      casesLost:            stats.casesLost,
      qaAnswersCount:       inter.qaAnswersCount,
      helpfulVotesReceived: inter.helpfulVotesReceived,
      interactionScore:     inter.interactionScore,
      interactionRank:      inter.interactionRank,
      awards:               inter.awards || []
    };
  });

  results.sort((a, b) => b.elo - a.elo);
  res.json(results);
});

export default router;

