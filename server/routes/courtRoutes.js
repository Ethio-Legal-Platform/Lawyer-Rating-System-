import { Router } from 'express';
import { readJSON, writeJSON } from '../lib/db.js';
import { USERS_PATH, COURT_CASES_PATH } from '../config/paths.js';
import { calculateLawyerRatings } from '../services/ratingService.js';

const router = Router();

// ── GET /api/court/lawyer-rating/:licenseNumber ────────────────────────────
// Returns real-time ELO score and performance statistics for a single lawyer.
router.get('/lawyer-rating/:licenseNumber', (req, res) => {
  const { licenseNumber } = req.params;
  const users      = readJSON(USERS_PATH);
  const courtCases = readJSON(COURT_CASES_PATH);

  const { eloMap, statsMap } = calculateLawyerRatings(users, courtCases);

  const elo   = eloMap[licenseNumber]   || 1000;
  const stats = statsMap[licenseNumber] || { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };

  const averageRating = stats.ratings.length > 0
    ? parseFloat((stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1))
    : 5.0;

  res.json({ licenseNumber, elo, casesWon: stats.casesWon, casesLost: stats.casesLost, totalCases: stats.totalCases, averageRating });
});

// ── GET /api/court/cases ───────────────────────────────────────────────────
// Returns all registered court cases.
router.get('/cases', (req, res) => {
  res.json(readJSON(COURT_CASES_PATH));
});

// ── POST /api/court/cases ──────────────────────────────────────────────────
// Registers a new court case and automatically updates real-time ratings.
router.post('/cases', (req, res) => {
  const {
    caseTitle, caseType,
    judgeId, judgeName,
    plaintiffClientId, plaintiffClientName,
    plaintiffLawyerLicense, plaintiffLawyerName,
    judgeRatingPlaintiff, clientRatingPlaintiff,
    defendantClientId, defendantClientName,
    defendantLawyerLicense, defendantLawyerName,
    judgeRatingDefendant, clientRatingDefendant,
    verdict
  } = req.body;

  if (!plaintiffLawyerLicense && !defendantLawyerLicense) {
    return res.status(400).json({ error: 'At least one lawyer license ID is required to register a case' });
  }

  const courtCases = readJSON(COURT_CASES_PATH);

  const newCase = {
    caseId: `CASE-2026-${String(courtCases.length + 1).padStart(3, '0')}`,
    caseTitle:  caseTitle  || 'Judicial Case Proceeding',
    caseType:   caseType   || 'Civil',
    dateDecided: new Date().toISOString().split('T')[0],
    judgeId:    judgeId    || 'JUDGE-GOV-001',
    judgeName:  judgeName  || 'Hon. Presiding Judge',

    plaintiffClientId:       plaintiffClientId       || 'client-1',
    plaintiffClientName:     plaintiffClientName     || 'Plaintiff Litigant',
    plaintiffLawyerLicense:  plaintiffLawyerLicense  || null,
    plaintiffLawyerName:     plaintiffLawyerName     || 'Plaintiff Advocate',
    judgeRatingPlaintiff:    judgeRatingPlaintiff  !== undefined ? Number(judgeRatingPlaintiff)  : 5.0,
    clientRatingPlaintiff:   clientRatingPlaintiff !== undefined ? Number(clientRatingPlaintiff) : 5.0,

    defendantClientId:       defendantClientId       || 'client-2',
    defendantClientName:     defendantClientName     || 'Defendant Litigant',
    defendantLawyerLicense:  defendantLawyerLicense  || null,
    defendantLawyerName:     defendantLawyerName     || 'Defendant Advocate',
    judgeRatingDefendant:    judgeRatingDefendant  !== undefined ? Number(judgeRatingDefendant)  : 4.0,
    clientRatingDefendant:   clientRatingDefendant !== undefined ? Number(clientRatingDefendant) : 4.0,

    verdict: verdict || 'Decided'
  };

  courtCases.push(newCase);
  writeJSON(COURT_CASES_PATH, courtCases);

  res.status(201).json({
    message: 'Case registered. Real-time ratings updated and verdict stored for analytics.',
    case: newCase
  });
});

export default router;
