import { Router } from "express";
import { mongoose } from "../lib/mongoose.js";
import { calculateLawyerRatings } from "../services/ratingService.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

async function getAllUsers() {
  if (mongoose.connection.readyState === 1) {
    const User = (await import("../models/User.js")).default;
    return User.find().lean();
  }
  const { readJSON } = await import("../lib/db.js");
  const { USERS_PATH } = await import("../config/paths.js");
  return readJSON(USERS_PATH);
}

async function getAllCases() {
  if (mongoose.connection.readyState === 1) {
    const CourtCase = (await import("../models/CourtCase.js")).default;
    return CourtCase.find().lean();
  }
  const { readJSON } = await import("../lib/db.js");
  const { COURT_CASES_PATH } = await import("../config/paths.js");
  return readJSON(COURT_CASES_PATH);
}

router.get("/lawyer-rating/:licenseNumber", async (req, res) => {
  try {
    const { licenseNumber } = req.params;
    const [users, courtCases] = await Promise.all([
      getAllUsers(),
      getAllCases(),
    ]);
    const { eloMap, statsMap } = calculateLawyerRatings(users, courtCases);

    const elo = eloMap[licenseNumber] || 1000;
    const stats = statsMap[licenseNumber] || {
      casesWon: 0,
      casesLost: 0,
      totalCases: 0,
      ratings: [],
    };
    const averageRating =
      stats.ratings.length > 0
        ? parseFloat(
            (
              stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
            ).toFixed(1),
          )
        : 5.0;

    res.json({
      licenseNumber,
      elo,
      casesWon: stats.casesWon,
      casesLost: stats.casesLost,
      totalCases: stats.totalCases,
      averageRating,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cases", async (req, res) => {
  try {
    res.json(await getAllCases());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/cases",
  requireAuth,
  requireRole("judge", "admin"),
  async (req, res) => {
    const {
      caseTitle,
      caseType,
      judgeId,
      judgeName,
      plaintiffClientId,
      plaintiffClientName,
      plaintiffLawyerLicense,
      plaintiffLawyerName,
      judgeRatingPlaintiff,
      clientRatingPlaintiff,
      defendantClientId,
      defendantClientName,
      defendantLawyerLicense,
      defendantLawyerName,
      judgeRatingDefendant,
      clientRatingDefendant,
      verdict,
    } = req.body;

    if (!plaintiffLawyerLicense && !defendantLawyerLicense) {
      return res
        .status(400)
        .json({ error: "At least one lawyer license ID is required" });
    }

    try {
      const allCases = await getAllCases();
      const newCase = {
        caseId: `CASE-2026-${String(allCases.length + 1).padStart(3, "0")}`,
        caseTitle: caseTitle || "Judicial Case Proceeding",
        caseType: caseType || "Civil",
        dateDecided: new Date().toISOString().split("T")[0],
        judgeId: judgeId || "JUDGE-GOV-001",
        judgeName: judgeName || "Hon. Presiding Judge",
        plaintiffClientId: plaintiffClientId || "client-1",
        plaintiffClientName: plaintiffClientName || "Plaintiff Litigant",
        plaintiffLawyerLicense: plaintiffLawyerLicense || null,
        plaintiffLawyerName: plaintiffLawyerName || "Plaintiff Advocate",
        judgeRatingPlaintiff:
          judgeRatingPlaintiff !== undefined
            ? Number(judgeRatingPlaintiff)
            : 5.0,
        clientRatingPlaintiff:
          clientRatingPlaintiff !== undefined
            ? Number(clientRatingPlaintiff)
            : 5.0,
        defendantClientId: defendantClientId || "client-2",
        defendantClientName: defendantClientName || "Defendant Litigant",
        defendantLawyerLicense: defendantLawyerLicense || null,
        defendantLawyerName: defendantLawyerName || "Defendant Advocate",
        judgeRatingDefendant:
          judgeRatingDefendant !== undefined
            ? Number(judgeRatingDefendant)
            : 4.0,
        clientRatingDefendant:
          clientRatingDefendant !== undefined
            ? Number(clientRatingDefendant)
            : 4.0,
        verdict: verdict || "Decided",
      };

      if (mongoose.connection.readyState === 1) {
        const CourtCase = (await import("../models/CourtCase.js")).default;
        await CourtCase.create(newCase);
      } else {
        const { readJSON, writeJSON } = await import("../lib/db.js");
        const { COURT_CASES_PATH } = await import("../config/paths.js");
        const cases = readJSON(COURT_CASES_PATH);
        cases.push(newCase);
        writeJSON(COURT_CASES_PATH, cases);
      }

      res
        .status(201)
        .json({
          message: "Case registered. Real-time ratings updated.",
          case: newCase,
        });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;
