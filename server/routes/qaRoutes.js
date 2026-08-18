import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  getPrivateInquiries,
  createQuestion,
  publishQuestionToPublic,
  addAnswer,
  upvoteAnswer
} from '../services/qaService.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/qa/questions
 * Query params: category, search, city, includePrivate
 */
router.get('/questions', (req, res) => {
  try {
    const { category, search, city, includePrivate } = req.query;
    const questions = getQuestions({
      category,
      search,
      city,
      includePrivate: includePrivate === 'true'
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/qa/inquiries
 * Query params: userId, role, city, specialization
 */
router.get('/inquiries', (req, res) => {
  try {
    const { userId, role, city, specialization } = req.query;
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required to fetch private inquiries' });
    }
    const inquiries = getPrivateInquiries({ userId, role, city, specialization });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/qa/questions/:id
 */
router.get('/questions/:id', (req, res) => {
  try {
    const question = getQuestionById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/qa/questions
 */
router.post('/questions', requireAuth, (req, res) => {
  try {
    const {
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
    } = req.body;

    const newQuestion = createQuestion({
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
    });

    res.status(201).json({ message: 'Question posted successfully', question: newQuestion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/qa/questions/:id/publish
 * Litigant approves pushing private consultation to public Q&A
 */
router.post('/questions/:id/publish', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(401).json({ error: 'You must be signed in as the author to publish' });
    }
    const publishedQuestion = publishQuestionToPublic(id, userId);
    res.json({ message: 'Question published to public forum successfully', question: publishedQuestion });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/qa/questions/:id/answers
 */
router.post('/questions/:id/answers', (req, res) => {
  try {
    const questionId = req.params.id;
    const {
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
    } = req.body;

    const resolvedAuthorId = req.user?.id || authorId;
    if (!resolvedAuthorId) {
      return res.status(401).json({ error: 'Authentication required to post a reply' });
    }

    const newAnswer = addAnswer(questionId, {
      content,
      authorId: resolvedAuthorId,
      authorName,
      authorUsername,
      authorRole: isLawyer ? 'lawyer' : (authorRole || 'client'),
      isLawyer: Boolean(isLawyer),
      licenseNumber,
      specialization,
      elo,
      profilePic,
      city
    });

    res.status(201).json({ message: 'Answer posted successfully', answer: newAnswer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/qa/questions/:id/answers/:answerId/upvote
 */
router.post('/questions/:id/answers/:answerId/upvote', (req, res) => {
  try {
    const { id, answerId } = req.params;
    const userId = req.user?.id || req.body?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'You must be signed in to upvote answers' });
    }
    const result = upvoteAnswer(id, answerId, userId);
    res.json({ message: result.hasUpvoted ? 'Answer upvoted' : 'Upvote removed', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
