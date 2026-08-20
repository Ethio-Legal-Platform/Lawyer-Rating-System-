/**
 * Real-time ELO Rating Engine for the LEX-RATING platform.
 *
 * Rules:
 * 1. ELO Rating is strictly functional ONLY when TWO practicing advocates engage in debate (Lawyer vs. Lawyer).
 * 2. It does NOT apply to unrepresented/self-represented cases (Lawyer vs. Client).
 * 3. It does NOT apply to state prosecution proceedings (Prosecutor vs. Defense Lawyer).
 *
 * K-factor = 32 (standard international chess ELO K-factor).
 *
 * @param {Array} users      - All registered users (lawyers filtered internally).
 * @param {Array} courtCases - All court case records.
 * @returns {{ eloMap: Object, statsMap: Object }}
 */

/**
 * Determines whether a court case represents an eligible adversarial debate
 * between two private legal practitioners (excluding prosecutors and unrepresented parties).
 */
export function isEligibleLawyerDebate(c) {
  if (!c) return false;

  const licP = c.plaintiffLawyerLicense ? String(c.plaintiffLawyerLicense).trim().toUpperCase() : null;
  const licD = c.defendantLawyerLicense ? String(c.defendantLawyerLicense).trim().toUpperCase() : null;

  // 1. MUST have two distinct valid advocate licenses
  if (!licP || !licD || licP === licD) {
    return false;
  }

  // 2. Filter out public/state prosecutor proceedings
  const prosecutorKeywords = [
    'prosecutor',
    'prosecution',
    'attorney general',
    'state attorney',
    'public prosecutor',
    'ዓቃቤ ሕግ',
    'ዐቃቤ ሕግ',
    'የፌደራል ዓቃቤ ሕግ'
  ];

  const pName   = String(c.plaintiffLawyerName || '').toLowerCase();
  const dName   = String(c.defendantLawyerName || '').toLowerCase();
  const pClient = String(c.plaintiffClientName || '').toLowerCase();
  const dClient = String(c.defendantClientName || '').toLowerCase();

  const isProsecution = prosecutorKeywords.some(kw =>
    pName.includes(kw) ||
    dName.includes(kw) ||
    pClient.includes(kw) ||
    dClient.includes(kw)
  );

  if (isProsecution) {
    return false;
  }

  return true;
}

export function calculateLawyerRatings(users, courtCases) {
  const eloMap   = {};
  const statsMap = {};
  const K = 32;

  // Initialise every registered lawyer with base ELO 1000
  users.forEach(u => {
    if (u.role === 'lawyer' && u.licenseNumber) {
      eloMap[u.licenseNumber]   = 1000;
      statsMap[u.licenseNumber] = { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };
    }
  });

  courtCases.forEach(c => {
    // Only calculate when 2 advocates made the debate (Lawyer vs Lawyer)
    if (!isEligibleLawyerDebate(c)) {
      return;
    }

    const licP = String(c.plaintiffLawyerLicense).trim().toUpperCase();
    const licD = String(c.defendantLawyerLicense).trim().toUpperCase();

    if (!eloMap[licP])   eloMap[licP]   = 1000;
    if (!statsMap[licP]) statsMap[licP] = { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };
    if (!eloMap[licD])   eloMap[licD]   = 1000;
    if (!statsMap[licD]) statsMap[licD] = { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };

    // ── 1. Gather Quality Ratings (Judge + Client) for each advocate ────────
    const pRatings = [];
    if (typeof c.judgeRatingPlaintiff === 'number' && !isNaN(c.judgeRatingPlaintiff)) pRatings.push(c.judgeRatingPlaintiff);
    if (typeof c.clientRatingPlaintiff === 'number' && !isNaN(c.clientRatingPlaintiff)) pRatings.push(c.clientRatingPlaintiff);

    const dRatings = [];
    if (typeof c.judgeRatingDefendant === 'number' && !isNaN(c.judgeRatingDefendant)) dRatings.push(c.judgeRatingDefendant);
    if (typeof c.clientRatingDefendant === 'number' && !isNaN(c.clientRatingDefendant)) dRatings.push(c.clientRatingDefendant);

    if (pRatings.length > 0) statsMap[licP].ratings.push(...pRatings);
    if (dRatings.length > 0) statsMap[licD].ratings.push(...dRatings);

    // ── 2. Track Case Statistics ───────────────────────────────────────────
    statsMap[licP].totalCases += 1;
    statsMap[licD].totalCases += 1;

    let sP = 0.5; // Plaintiff actual outcome (1 = win, 0 = loss, 0.5 = draw/settled)
    let sD = 0.5; // Defendant actual outcome

    if (c.verdict === 'Plaintiff') {
      statsMap[licP].casesWon  += 1;
      statsMap[licD].casesLost += 1;
      sP = 1.0;
      sD = 0.0;
    } else if (c.verdict === 'Defendant') {
      statsMap[licD].casesWon  += 1;
      statsMap[licP].casesLost += 1;
      sP = 0.0;
      sD = 1.0;
    }

    // ── 3. Head-to-Head ELO Calculation ───────────────────────────────────
    const rP = eloMap[licP];
    const rD = eloMap[licD];

    // Standard Expected Score formulas
    const expP = 1.0 / (1.0 + Math.pow(10, (rD - rP) / 400.0));
    const expD = 1.0 / (1.0 + Math.pow(10, (rP - rD) / 400.0));

    // Optional rating performance bonus if judge/client ratings are present
    const pAvgRating = pRatings.length > 0 ? (pRatings.reduce((a, b) => a + b, 0) / pRatings.length) : 3.5;
    const dAvgRating = dRatings.length > 0 ? (dRatings.reduce((a, b) => a + b, 0) / dRatings.length) : 3.5;

    const ratingBonusP = (pAvgRating - 3.5) * 0.15;
    const ratingBonusD = (dAvgRating - 3.5) * 0.15;

    eloMap[licP] = Math.round(rP + K * (sP - expP + ratingBonusP));
    eloMap[licD] = Math.round(rD + K * (sD - expD + ratingBonusD));
  });

  return { eloMap, statsMap };
}
