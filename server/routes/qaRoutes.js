import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  getPrivateInquiries,
  createQuestion,
  publishQuestionToPublic,
  addAnswer,
  upvoteAnswer,
} from '../services/qaService.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/questions', async (req, res) => {
  try {
    const { category, search, city, includePrivate } = req.query;
    res.json(await getQuestions({ category, search, city, includePrivate: includePrivate === 'true' }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/inquiries', async (req, res) => {
  try {
    const { userId, role, city, specialization } = req.query;
    if (!userId) return res.status(401).json({ error: 'userId is required' });
    res.json(await getPrivateInquiries({ userId, role, city, specialization }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/questions/:id', async (req, res) => {
  try {
    const q = await getQuestionById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    res.json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/questions', requireAuth, async (req, res) => {
  try {
    const q = await createQuestion(req.body);
    res.status(201).json({ message: 'Question posted successfully', question: q });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/questions/:id/publish', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(401).json({ error: 'userId is required' });
    const q = await publishQuestionToPublic(req.params.id, userId);
    res.json({ message: 'Question published to public forum', question: q });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/questions/:id/answers', requireAuth, async (req, res) => {
  try {
    const answer = await addAnswer(req.params.id, req.body);
    res.status(201).json({ message: 'Answer posted successfully', answer });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/questions/:id/answers/:answerId/upvote', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(401).json({ error: 'userId is required' });
    const result = await upvoteAnswer(req.params.id, req.params.answerId, userId);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
