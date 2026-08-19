import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_123456789_lex_rating');
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
