export function requireGovApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const expectedKey = process.env.GOV_INTEGRATION_API_KEY || 'moj_court_sec_key_98374189234812398471';

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'A valid government integration API key is required in the X-API-KEY header.'
    });
  }
  next();
}
