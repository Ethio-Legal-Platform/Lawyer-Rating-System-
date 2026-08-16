/**
 * Real-time ELO Rating Engine for the LEX-RATING platform.
 *
 * Iterates all court cases and computes each lawyer's ELO score and
 * performance statistics based on judge + client ratings.
 *
 * K-factor = 32 (standard chess K-factor, applied to a 1–7 star scale
 * where 3.5 is the "neutral" midpoint).
 *
 * @param {Array} users      - All registered users (lawyers filtered internally).
 * @param {Array} courtCases - All court case records.
 * @returns {{ eloMap: Object, statsMap: Object }}
 *   eloMap:   { [licenseNumber]: eloScore }
 *   statsMap: { [licenseNumber]: { casesWon, casesLost, totalCases, ratings[] } }
 */
export function calculateLawyerRatings(users, courtCases) {
  const eloMap   = {};
  const statsMap = {};
  const K = 32;

  // Initialise every registered lawyer with base ELO 1000
  users.forEach(u => {
    if (u.role === 'lawyer') {
      eloMap[u.licenseNumber]   = 1000;
      statsMap[u.licenseNumber] = { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };
    }
  });

  courtCases.forEach(c => {
    // ── Plaintiff lawyer ─────────────────────────────────────────────────────
    if (c.plaintiffLawyerLicense) {
      const lic = c.plaintiffLawyerLicense;
      if (!eloMap[lic])   eloMap[lic]   = 1000;
      if (!statsMap[lic]) statsMap[lic] = { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };

      const jRating  = typeof c.judgeRatingPlaintiff  === 'number' ? c.judgeRatingPlaintiff  : 5.0;
      const cRating  = typeof c.clientRatingPlaintiff === 'number' ? c.clientRatingPlaintiff : jRating;
      const caseScore = (jRating + cRating) / 2.0;

      statsMap[lic].ratings.push(jRating, cRating);
      statsMap[lic].totalCases += 1;

      if (c.verdict === 'Plaintiff') statsMap[lic].casesWon  += 1;
      else if (c.verdict === 'Defendant') statsMap[lic].casesLost += 1;

      eloMap[lic] = Math.round(eloMap[lic] + K * (caseScore - 3.5));
    }

    // ── Defendant lawyer ─────────────────────────────────────────────────────
    if (c.defendantLawyerLicense) {
      const lic = c.defendantLawyerLicense;
      if (!eloMap[lic])   eloMap[lic]   = 1000;
      if (!statsMap[lic]) statsMap[lic] = { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };

      const jRating  = typeof c.judgeRatingDefendant  === 'number' ? c.judgeRatingDefendant  : 4.0;
      const cRating  = typeof c.clientRatingDefendant === 'number' ? c.clientRatingDefendant : jRating;
      const caseScore = (jRating + cRating) / 2.0;

      statsMap[lic].ratings.push(jRating, cRating);
      statsMap[lic].totalCases += 1;

      if (c.verdict === 'Defendant') statsMap[lic].casesWon  += 1;
      else if (c.verdict === 'Plaintiff') statsMap[lic].casesLost += 1;

      eloMap[lic] = Math.round(eloMap[lic] + K * (caseScore - 3.5));
    }
  });

  return { eloMap, statsMap };
}
