import { Router } from 'express';
import { mongoose } from '../lib/mongoose.js';
import { calculateLawyerRatings } from '../services/ratingService.js';
import { requireGovApiKey } from '../middleware/apiKeyAuth.js';

const router = Router();

// Helper to get or import models / files
async function getDBHelpers() {
  if (mongoose.connection.readyState === 1) {
    const CourtCase  = (await import('../models/CourtCase.js')).default;
    const MojLicense = (await import('../models/MojLicense.js')).default;
    const User       = (await import('../models/User.js')).default;
    return { isMongo: true, CourtCase, MojLicense, User };
  }
  const { readJSON, writeJSON } = await import('../lib/db.js');
  const { USERS_PATH, COURT_CASES_PATH, MOJ_LICENSES_PATH } = await import('../config/paths.js');
  return { isMongo: false, readJSON, writeJSON, USERS_PATH, COURT_CASES_PATH, MOJ_LICENSES_PATH };
}

// ── GET /api/integrations/health ───────────────────────────────────────────
router.get('/health', requireGovApiKey, (req, res) => {
  res.json({
    status: 'online',
    system: 'LEX-RATING Government B2G Ingestion Gateway',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas' : 'Local JSON Fallback',
    timestamp: new Date().toISOString()
  });
});

// ── POST /api/integrations/moj/licenses ────────────────────────────────────
// Ingests MoJ Advocate Licenses (Single object or Array)
router.post('/moj/licenses', requireGovApiKey, async (req, res) => {
  try {
    const rawList = Array.isArray(req.body) ? req.body : [req.body];
    if (!rawList.length) {
      return res.status(400).json({ error: 'Request body must contain at least one license record.' });
    }

    const db = await getDBHelpers();
    const syncedRecords = [];

    for (const lic of rawList) {
      if (!lic.licenseNumber || !lic.fullName) continue;

      const licenseData = {
        licenseNumber:  String(lic.licenseNumber).trim().toUpperCase(),
        fullName:       String(lic.fullName).trim(),
        status:         lic.status         || 'Active',
        tier:           lic.tier           || 'Federal High Court & Supreme Court',
        issuedDate:     lic.issuedDate     || new Date().toISOString().split('T')[0],
        expiryDate:     lic.expiryDate     || null,
        specialization: lic.specialization || 'General Practice',
        region:         lic.region         || 'Federal'
      };

      if (db.isMongo) {
        const saved = await db.MojLicense.findOneAndUpdate(
          { licenseNumber: licenseData.licenseNumber },
          { $set: licenseData },
          { upsert: true, new: true }
        );
        syncedRecords.push(saved);
      } else {
        const licenses = db.readJSON(db.MOJ_LICENSES_PATH);
        const idx = licenses.findIndex(l => l.licenseNumber === licenseData.licenseNumber);
        if (idx >= 0) licenses[idx] = { ...licenses[idx], ...licenseData };
        else licenses.push(licenseData);
        db.writeJSON(db.MOJ_LICENSES_PATH, licenses);
        syncedRecords.push(licenseData);
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully synced ${syncedRecords.length} MoJ advocate license records.`,
      syncedCount: syncedRecords.length,
      records: syncedRecords
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process MoJ license ingestion', details: err.message });
  }
});

// ── POST /api/integrations/court/cases ─────────────────────────────────────
// Ingests Court Cases and automatically calculates lawyer ELO ratings in real time
router.post('/court/cases', requireGovApiKey, async (req, res) => {
  try {
    const rawList = Array.isArray(req.body) ? req.body : [req.body];
    if (!rawList.length) {
      return res.status(400).json({ error: 'Request body must contain at least one court case record.' });
    }

    const db = await getDBHelpers();
    const processedCases = [];

    for (const c of rawList) {
      if (!c.caseId || !c.caseTitle) continue;

      const caseData = {
        caseId:                 String(c.caseId).trim(),
        caseTitle:              String(c.caseTitle).trim(),
        caseType:               c.caseType || 'Civil',
        dateDecided:            c.dateDecided || new Date().toISOString().split('T')[0],
        judgeId:                c.judgeId   || 'JUDGE-EXT',
        judgeName:              c.judgeName || 'Hon. Presiding Judge',
        courtLevel:             c.courtLevel || 'Federal High Court',

        plaintiffClientId:      c.plaintiffClientId || null,
        plaintiffClientName:    c.plaintiffClientName || 'Plaintiff',
        plaintiffLawyerLicense: c.plaintiffLawyerLicense ? String(c.plaintiffLawyerLicense).trim().toUpperCase() : null,
        plaintiffLawyerName:    c.plaintiffLawyerName || 'Plaintiff Advocate',
        judgeRatingPlaintiff:   c.judgeRatingPlaintiff !== undefined && c.judgeRatingPlaintiff !== null && c.judgeRatingPlaintiff !== '' ? Number(c.judgeRatingPlaintiff) : 5.0,
        clientRatingPlaintiff:  c.clientRatingPlaintiff !== undefined && c.clientRatingPlaintiff !== null && c.clientRatingPlaintiff !== '' ? Number(c.clientRatingPlaintiff) : null,

        defendantClientId:      c.defendantClientId || null,
        defendantClientName:    c.defendantClientName || 'Defendant',
        defendantLawyerLicense: c.defendantLawyerLicense ? String(c.defendantLawyerLicense).trim().toUpperCase() : null,
        defendantLawyerName:    c.defendantLawyerName || 'Defendant Advocate',
        judgeRatingDefendant:   c.judgeRatingDefendant !== undefined && c.judgeRatingDefendant !== null && c.judgeRatingDefendant !== '' ? Number(c.judgeRatingDefendant) : 4.0,
        clientRatingDefendant:  c.clientRatingDefendant !== undefined && c.clientRatingDefendant !== null && c.clientRatingDefendant !== '' ? Number(c.clientRatingDefendant) : null,

        verdict:                c.verdict || 'Decided'
      };

      if (db.isMongo) {
        const saved = await db.CourtCase.findOneAndUpdate(
          { caseId: caseData.caseId },
          { $set: caseData },
          { upsert: true, new: true }
        );
        processedCases.push(saved);
      } else {
        const cases = db.readJSON(db.COURT_CASES_PATH);
        const idx = cases.findIndex(item => item.caseId === caseData.caseId);
        if (idx >= 0) cases[idx] = { ...cases[idx], ...caseData };
        else cases.push(caseData);
        db.writeJSON(db.COURT_CASES_PATH, cases);
        processedCases.push(caseData);
      }
    }

    // ── Recalculate and update Lawyer ELO Ratings automatically ──────────────
    let allUsers = [];
    let allCases = [];

    if (db.isMongo) {
      allUsers = await db.User.find().lean();
      allCases = await db.CourtCase.find().lean();
    } else {
      allUsers = db.readJSON(db.USERS_PATH);
      allCases = db.readJSON(db.COURT_CASES_PATH);
    }

    const { eloMap } = calculateLawyerRatings(allUsers, allCases);

    if (db.isMongo) {
      for (const [lic, elo] of Object.entries(eloMap)) {
        await db.User.updateOne({ licenseNumber: lic }, { $set: { elo } });
      }
    } else {
      let updatedUsers = false;
      allUsers.forEach(u => {
        if (u.role === 'lawyer' && u.licenseNumber && eloMap[u.licenseNumber] !== undefined) {
          u.elo = eloMap[u.licenseNumber];
          updatedUsers = true;
        }
      });
      if (updatedUsers) db.writeJSON(db.USERS_PATH, allUsers);
    }

    res.status(201).json({
      success: true,
      message: `Successfully ingested ${processedCases.length} court cases. Lawyer ELO ratings recalculated.`,
      ingestedCount: processedCases.length,
      cases: processedCases
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process court case ingestion', details: err.message });
  }
});

export default router;
