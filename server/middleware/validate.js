export function requireFields(...fields) {
  return (req, res, next) => {
    const missing = fields.filter(f => {
      const val = req.body[f];
      return val === undefined || val === null || String(val).trim() === '';
    });
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`
      });
    }
    next();
  };
}

/**
 * Middleware that sanitizes all string fields in req.body by trimming whitespace.
 */
export function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
}

/**
 * Middleware that enforces a minimum password length of 6 characters.
 */
export function validatePassword(req, res, next) {
  const { password } = req.body;
  if (password !== undefined && String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  next();
}

/**
 * Middleware that validates an email field has a plausible format.
 */
export function validateEmail(req, res, next) {
  const { email } = req.body;
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format' });
  }
  next();
}
