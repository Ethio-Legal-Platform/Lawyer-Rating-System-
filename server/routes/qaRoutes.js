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
