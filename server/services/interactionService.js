import { mongoose } from "../lib/mongoose.js";

// ── Lazy model imports (only resolved when MongoDB is connected) ──────────────

async function getUserModel() {
  return (await import("../models/User.js")).default;
}

async function getQuestionModel() {
  return (await import("../models/Questions.js")).default;
}

async function getCourtCaseModel() {
  return (await import("../models/CourtCase.js")).default;
}

// ── Data access helpers ───────────────────────────────────────────────────────

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

async function fetchUsers() {
  if (isMongoConnected()) {
    const User = await getUserModel();
    return User.find({ role: "lawyer", verified: true }).lean();
  }
  const { readJSON } = await import("../lib/db.js");
  const { USERS_PATH } = await import("../config/paths.js");
  const all = readJSON(USERS_PATH, []);
  return all.filter((u) => u.role === "lawyer" && u.verified);
}

async function fetchQuestions() {
  if (isMongoConnected()) {
    const Question = await getQuestionModel();
    return Question.find().lean();
  }
  const { readJSON } = await import("../lib/db.js");
  const { QUESTIONS_PATH } = await import("../config/paths.js");
  return readJSON(QUESTIONS_PATH, []);
}

async function fetchCourtCases() {
  if (isMongoConnected()) {
    const CourtCase = await getCourtCaseModel();
    return CourtCase.find().lean();
  }
  const { readJSON } = await import("../lib/db.js");
  const { COURT_CASES_PATH } = await import("../config/paths.js");
  return readJSON(COURT_CASES_PATH, []);
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Calculates real-time interaction metrics and bestows awards to the most
 * interactive advocates.  Works with both MongoDB and the JSON fallback layer.
 */
export async function calculateLawyerInteractions() {
  const [lawyers, questions, courtCases] = await Promise.all([
    fetchUsers(),
    fetchQuestions(),
    fetchCourtCases(),
  ]);

  // Build a map keyed by lawyer id for O(1) accumulation
  const lawyerMap = {};
  lawyers.forEach((l) => {
    lawyerMap[l.id] = {
      id: l.id,
      name: l.name,
      licenseNumber: l.licenseNumber,
      specialization: l.specialization,
      city: l.city || "Addis Ababa",
      profilePic: l.profilePic,
      qaAnswersCount: 0,
      helpfulVotesReceived: 0,
      casesCount: 0,
      interactionScore: 0,
      awards: [],
    };
  });

  // ── 1. Q&A answers & helpful upvotes ───────────────────────────────────────
  questions.forEach((q) => {
    if (!Array.isArray(q.answers)) return;
    q.answers.forEach((ans) => {
      if (!ans.isLawyer) return;

      // Prefer matching by authorId, fall back to licenseNumber
      let entry = ans.authorId ? lawyerMap[ans.authorId] : null;
      if (!entry && ans.licenseNumber) {
        const found = Object.values(lawyerMap).find(
          (l) => l.licenseNumber === ans.licenseNumber,
        );
        entry = found || null;
      }

      if (entry) {
        entry.qaAnswersCount += 1;
        entry.helpfulVotesReceived += ans.upvotes || 0;
      }
    });
  });

  // ── 2. Court cases handled ─────────────────────────────────────────────────
  courtCases.forEach((c) => {
    // Match by license number (plaintiff / defendant sides)
    [c.plaintiffLawyerLicense, c.defendantLawyerLicense]
      .filter(Boolean)
      .forEach((lic) => {
        const entry = Object.values(lawyerMap).find(
          (l) => l.licenseNumber === lic,
        );
        if (entry) entry.casesCount += 1;
      });

    // Also handle legacy single-lawyer cases stored with lawyerId
    if (c.lawyerId && lawyerMap[c.lawyerId]) {
      lawyerMap[c.lawyerId].casesCount += 1;
    }
  });

  // ── 3. Compute interaction score ───────────────────────────────────────────
  // Formula: Answers × 15 + Helpful Upvotes × 5 + Cases × 2
  const rankedList = Object.values(lawyerMap).map((l) => ({
    ...l,
    interactionScore:
      l.qaAnswersCount * 15 + l.helpfulVotesReceived * 5 + l.casesCount * 2,
  }));

  // Sort descending
  rankedList.sort((a, b) => b.interactionScore - a.interactionScore);

  // ── 4. Assign ranks and prestige awards ────────────────────────────────────
  rankedList.forEach((lawyer, index) => {
    lawyer.interactionRank = index + 1;
    const awards = [];

    if (index === 0 && lawyer.interactionScore > 0) {
      awards.push({
        title: "National Legal Community Champion",
        icon: "🏆",
        tier: "Rank #1",
        desc: "Top Most Interactive Legal Practitioner in Ethiopia",
      });
    } else if (index === 1 && lawyer.interactionScore > 0) {
      awards.push({
        title: "Distinguished Legal Contributor",
        icon: "⭐",
        tier: "Rank #2",
        desc: "Top Pro Bono Legal Contributor",
      });
    } else if (index === 2 && lawyer.interactionScore > 0) {
      awards.push({
        title: "Outstanding Pro Bono Advisor",
        icon: "🌟",
        tier: "Rank #3",
        desc: "Top Community Q&A Advisor",
      });
    }

    if (lawyer.helpfulVotesReceived >= 10 || lawyer.qaAnswersCount >= 2) {
      awards.push({
        title: "MoJ Community Impact Recognition",
        icon: "🎖️",
        tier: "Distinction",
        desc: `Helped ${lawyer.helpfulVotesReceived}+ citizens with verified legal guidance`,
      });
    }

    if (lawyer.casesCount >= 4) {
      awards.push({
        title: "Veteran Courtroom Practitioner",
        icon: "⚖️",
        tier: "Experience",
        desc: `Successfully handled ${lawyer.casesCount}+ verified court cases`,
      });
    }

    lawyer.awards = awards;
  });

  // ── 5. Build a dual-key lookup map (by id and by licenseNumber) ────────────
  const interactionMap = {};
  rankedList.forEach((l) => {
    interactionMap[l.id] = l;
    if (l.licenseNumber) interactionMap[l.licenseNumber] = l;
  });

  return { rankedList, interactionMap };
}
