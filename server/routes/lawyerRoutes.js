import { Router } from "express";
import { mongoose } from "../lib/mongoose.js";
import { calculateLawyerRatings } from "../services/ratingService.js";

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

router.get("/search", async (req, res) => {
  try {
    const specQuery = (req.query.specialization || "").toLowerCase().trim();
    const nameQuery = (req.query.name || "").toLowerCase().trim();
    const cityQuery = (req.query.city || "").toLowerCase().trim();
    const searchQuery = (req.query.search || req.query.q || "")
      .toLowerCase()
      .trim();

    const [users, courtCases] = await Promise.all([
      getAllUsers(),
      getAllCases(),
    ]);
    const { eloMap, statsMap } = calculateLawyerRatings(users, courtCases);

    const matching = users.filter((u) => {
      if (u.role !== "lawyer" || !u.verified) return false;

      const uSpec = (u.specialization || "").toLowerCase();
      const uCity = (u.city || "").toLowerCase();
      const uName = (u.name || "").toLowerCase();
      const uBio = (u.bio || "").toLowerCase();
      const uLic = (u.licenseNumber || "").toLowerCase();

      if (nameQuery && !uName.includes(nameQuery)) return false;
      if (specQuery && !uSpec.includes(specQuery) && !uName.includes(specQuery))
        return false;
      if (cityQuery && !uCity.includes(cityQuery)) return false;
      if (
        searchQuery &&
        ![uName, uSpec, uCity, uBio, uLic].some((f) => f.includes(searchQuery))
      )
        return false;

      return true;
    });

    const results = matching.map((l) => {
      const elo = eloMap[l.licenseNumber] || 1000;
      const stats = statsMap[l.licenseNumber] || {
        casesWon: 0,
        casesLost: 0,
        totalCases: 0,
        ratings: [],
      };
      const rating =
        stats.ratings.length > 0
          ? parseFloat(
              (
                stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
              ).toFixed(1),
            )
          : 5.0;

      return {
        id: l.id,
        name: l.name,
        specialization: l.specialization,
        licenseNumber: l.licenseNumber,
        city: l.city || "Addis Ababa",
        phone: l.phone || "",
        bio: l.bio || "",
        yearsExperience: l.yearsExperience || 0,
        education: l.education || "",
        languages: l.languages || [],
        profilePic:
          l.profilePic ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
        elo,
        rating,
        casesCount: stats.totalCases,
        casesWon: stats.casesWon,
        casesLost: stats.casesLost,
      };
    });

    results.sort((a, b) => b.elo - a.elo);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
