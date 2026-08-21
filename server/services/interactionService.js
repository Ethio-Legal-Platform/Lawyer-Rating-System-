import path from 'path';
import { fileURLToPath } from 'url';
import { readJSON } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const QUESTIONS_FILE   = path.resolve(__dirname, '../data/questions.json');
const COURT_CASES_FILE = path.resolve(__dirname, '../data/court_cases.json');
const USERS_FILE       = path.resolve(__dirname, '../data/users.json');

/**
 * Calculates real-time interaction metrics and bestows awards to the most interactive advocates.
 */
export function calculateLawyerInteractions() {
  const users      = readJSON(USERS_FILE, []);
  const questions  = readJSON(QUESTIONS_FILE, []);
  const courtCases = readJSON(COURT_CASES_FILE, []);

  // Filter verified lawyers
  const lawyers = users.filter(u => u.role === 'lawyer' && u.verified);

  // Map to accumulate metrics per lawyer (by licenseNumber and id)
  const lawyerMap = {};

  lawyers.forEach(l => {
    lawyerMap[l.id] = {
      id: l.id,
      name: l.name,
      licenseNumber: l.licenseNumber,
      specialization: l.specialization,
      city: l.city || 'Addis Ababa',
      profilePic: l.profilePic,
      qaAnswersCount: 0,
      helpfulVotesReceived: 0,
      casesCount: 0,
      interactionScore: 0,
      awards: []
    };
  });

  // 1. Calculate Q&A answers & helpful upvotes
  questions.forEach(q => {
    if (Array.isArray(q.answers)) {
      q.answers.forEach(ans => {
        if (ans.isLawyer && ans.authorId && lawyerMap[ans.authorId]) {
          lawyerMap[ans.authorId].qaAnswersCount += 1;
          lawyerMap[ans.authorId].helpfulVotesReceived += (ans.upvotes || 0);
        } else if (ans.isLawyer && ans.licenseNumber) {
          // Match by licenseNumber if authorId didn't match
          const foundId = Object.keys(lawyerMap).find(id => lawyerMap[id].licenseNumber === ans.licenseNumber);
          if (foundId) {
            lawyerMap[foundId].qaAnswersCount += 1;
            lawyerMap[foundId].helpfulVotesReceived += (ans.upvotes || 0);
          }
        }
      });
    }
  });

  // 2. Calculate court cases handled
  courtCases.forEach(c => {
    [c.plaintiffLawyerLicense, c.defendantLawyerLicense].filter(Boolean).forEach(lic => {
      const foundId = Object.keys(lawyerMap).find(id => lawyerMap[id].licenseNumber === lic);
      if (foundId) {
        lawyerMap[foundId].casesCount += 1;
      }
    });
    if (c.lawyerId && lawyerMap[c.lawyerId]) {
      lawyerMap[c.lawyerId].casesCount += 1;
    }
  });

  // 3. Compute total interaction score
  // Formula: Answers * 15 + Helpful Upvotes * 5 + Cases Handled * 2
  const rankedList = Object.values(lawyerMap).map(l => {
    const score = (l.qaAnswersCount * 15) + (l.helpfulVotesReceived * 5) + (l.casesCount * 2);
    return {
      ...l,
      interactionScore: score
    };
  });

  // Sort descending by score
  rankedList.sort((a, b) => b.interactionScore - a.interactionScore);

  // 4. Assign ranks and prestige awards
  rankedList.forEach((lawyer, index) => {
    lawyer.interactionRank = index + 1;
    const awards = [];

    if (index === 0 && lawyer.interactionScore > 0) {
      awards.push({
        title: 'National Legal Community Champion',
        icon: '🏆',
        tier: 'Rank #1',
        desc: 'Top Most Interactive Legal Practitioner in Ethiopia'
      });
    } else if (index === 1 && lawyer.interactionScore > 0) {
      awards.push({
        title: 'Distinguished Legal Contributor',
        icon: '⭐',
        tier: 'Rank #2',
        desc: 'Top Pro Bono Legal Contributor'
      });
    } else if (index === 2 && lawyer.interactionScore > 0) {
      awards.push({
        title: 'Outstanding Pro Bono Advisor',
        icon: '🌟',
        tier: 'Rank #3',
        desc: 'Top Community Q&A Advisor'
      });
    }

    if (lawyer.helpfulVotesReceived >= 10 || lawyer.qaAnswersCount >= 2) {
      awards.push({
        title: 'MoJ Community Impact Recognition',
        icon: '🎖️',
        tier: 'Distinction',
        desc: `Helped ${lawyer.helpfulVotesReceived}+ citizens with verified legal guidance`
      });
    }

    if (lawyer.casesCount >= 4) {
      awards.push({
        title: 'Veteran Courtroom Practitioner',
        icon: '⚖️',
        tier: 'Experience',
        desc: `Successfully handled ${lawyer.casesCount}+ verified court cases`
      });
    }

    lawyer.awards = awards;
  });

  // Build lookup map by id and license
  const interactionMap = {};
  rankedList.forEach(l => {
    interactionMap[l.id] = l;
    if (l.licenseNumber) interactionMap[l.licenseNumber] = l;
  });

  return { rankedList, interactionMap };
}
