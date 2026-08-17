import path from 'path';
import { fileURLToPath } from 'url';
import { readJSON, writeJSON } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const QUESTIONS_FILE = path.resolve(__dirname, '../data/questions.json');

/**
 * Get all questions with optional filtering by category, search query, or city
 */
/**
 * Get all questions with optional filtering by category, search query, or city
 * Defaults to public questions only unless includePrivate or user filter is specified
 */
export function getQuestions({ category, search, city, includePrivate, userId, lawyerId, lawyerCity, lawyerSpec } = {}) {
  let questions = readJSON(QUESTIONS_FILE, []);

  // Filter public vs private
  if (!includePrivate) {
    questions = questions.filter(q => !q.isPrivate);
  }

  if (category && category !== 'All') {
    questions = questions.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }

  if (city && city !== 'All') {
    questions = questions.filter(q => q.city && q.city.toLowerCase() === city.toLowerCase());
  }

  if (search) {
    const qTerm = search.toLowerCase();
    questions = questions.filter(q => 
      q.title.toLowerCase().includes(qTerm) || 
      q.description.toLowerCase().includes(qTerm) ||
      (q.category && q.category.toLowerCase().includes(qTerm))
    );
  }

  // Sort by newest first
  return questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get private inquiries relevant to a client or nearby lawyer
 */
export function getPrivateInquiries({ userId, role, city, specialization }) {
  const questions = readJSON(QUESTIONS_FILE, []);
  const privateList = questions.filter(q => q.isPrivate);

  if (role === 'lawyer') {
    // Return inquiries targeted to this lawyer, or in their city & specialization
    return privateList.filter(q => {
      if (q.targetLawyerId && q.targetLawyerId === userId) return true;
      if (!q.targetLawyerId) {
        // Open nearby inquiry
        const matchCity = !city || !q.city || q.city.toLowerCase() === city.toLowerCase();
        const matchSpec = !specialization || !q.category || q.category.toLowerCase().includes(specialization.toLowerCase());
        return matchCity || matchSpec;
      }
      return false;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Client view: their own inquiries
  return privateList.filter(q => q.authorId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get single question by ID
 */
export function getQuestionById(id) {
  const questions = readJSON(QUESTIONS_FILE, []);
  return questions.find(q => q.id === id) || null;
}

/**
 * Create a new question (public or private consultation)
 */
export function createQuestion({
  title,
  description,
  category,
  city,
  authorName,
  authorRole,
  authorId,
  isPrivate,
  targetLawyerId,
  targetLawyerName
}) {
  if (!authorId) {
    throw new Error('You must be signed in to ask a question');
  }
  if (!title || !description) {
    throw new Error('Title and description are required');
  }

  const questions = readJSON(QUESTIONS_FILE, []);
  const newQuestion = {
    id: `q-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    category: category || 'General',
    city: city || 'Addis Ababa',
    authorName: authorName || 'Anonymous Litigant',
    authorRole: authorRole || 'client',
    authorId: authorId,
    isPrivate: Boolean(isPrivate),
    targetLawyerId: targetLawyerId || null,
    targetLawyerName: targetLawyerName || null,
    status: isPrivate ? 'private_pending' : 'public',
    createdAt: new Date().toISOString(),
    publishedAt: isPrivate ? null : new Date().toISOString(),
    answers: []
  };

  questions.unshift(newQuestion);
  writeJSON(QUESTIONS_FILE, questions);
  return newQuestion;
}

/**
 * Publish a private question to the public forum
 */
export function publishQuestionToPublic(questionId, userId) {
  const questions = readJSON(QUESTIONS_FILE, []);
  const q = questions.find(q => q.id === questionId);

  if (!q) {
    throw new Error('Question not found');
  }

  // Ensure only author can publish
  if (q.authorId !== userId) {
    throw new Error('Only the author can authorize making this consultation public');
  }

  q.isPrivate = false;
  q.status = 'public';
  q.publishedAt = new Date().toISOString();

  writeJSON(QUESTIONS_FILE, questions);
  return q;
}

/**
 * Add an answer / comment to a question
 */
export function addAnswer(questionId, {
  content,
  authorId,
  authorName,
  authorUsername,
  authorRole,
  isLawyer,
  licenseNumber,
  specialization,
  elo,
  profilePic,
  city
}) {
  if (!authorId) {
    throw new Error('You must be signed in to post a reply');
  }
  if (!content || !content.trim()) {
    throw new Error('Answer content cannot be empty');
  }

  const questions = readJSON(QUESTIONS_FILE, []);
  const index = questions.findIndex(q => q.id === questionId);

  if (index === -1) {
    throw new Error('Question not found');
  }

  const newAnswer = {
    id: `ans-${Date.now()}`,
    authorId: authorId,
    authorName: authorName || (isLawyer ? 'Advocate' : 'Community Member'),
    authorUsername: authorUsername || 'user',
    authorRole: isLawyer ? 'lawyer' : (authorRole || 'client'),
    isLawyer: Boolean(isLawyer),
    licenseNumber: licenseNumber || null,
    specialization: specialization || null,
    elo: elo || null,
    profilePic: profilePic || (isLawyer 
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    ),
    city: city || 'Ethiopia',
    content: content.trim(),
    createdAt: new Date().toISOString(),
    upvotes: 0,
    upvotedBy: []
  };

  if (!Array.isArray(questions[index].answers)) {
    questions[index].answers = [];
  }

  // Put lawyer answers first, or append
  if (isLawyer) {
    questions[index].answers.unshift(newAnswer);
    if (questions[index].isPrivate) {
      questions[index].status = 'advocate_answered';
    }
  } else {
    questions[index].answers.push(newAnswer);
  }

  writeJSON(QUESTIONS_FILE, questions);
  return newAnswer;
}

/**
 * Upvote an answer (1 vote per user toggle)
 */
export function upvoteAnswer(questionId, answerId, userId) {
  if (!userId) {
    throw new Error('You must be signed in to upvote answers');
  }

  const questions = readJSON(QUESTIONS_FILE, []);
  const q = questions.find(q => q.id === questionId);
  if (!q || !Array.isArray(q.answers)) {
    throw new Error('Question or answers not found');
  }

  const ans = q.answers.find(a => a.id === answerId);
  if (!ans) {
    throw new Error('Answer not found');
  }

  if (!Array.isArray(ans.upvotedBy)) {
    ans.upvotedBy = [];
  }

  const existingIdx = ans.upvotedBy.indexOf(userId);
  let hasUpvoted = false;

  if (existingIdx > -1) {
    // User already upvoted -> toggle off
    ans.upvotedBy.splice(existingIdx, 1);
    ans.upvotes = Math.max(0, (ans.upvotes || 1) - 1);
    hasUpvoted = false;
  } else {
    // Add upvote
    ans.upvotedBy.push(userId);
    ans.upvotes = (ans.upvotes || 0) + 1;
    hasUpvoted = true;
  }

  writeJSON(QUESTIONS_FILE, questions);
  return { answer: ans, hasUpvoted, upvotes: ans.upvotes };
}


