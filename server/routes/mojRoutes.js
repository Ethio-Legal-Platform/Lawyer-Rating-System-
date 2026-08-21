import { Router } from 'express';
import { mongoose } from '../lib/mongoose.js';

const router = Router();

async function getLicenses() {
  if (mongoose.connection.readyState === 1) {
    const MojLicense = (await import('../models/MojLicense.js')).default;
    return MojLicense.find().lean();
  }
  const { readJSON } = await import('../lib/db.js');
  const { MOJ_LICENSES_PATH } = await import('../config/paths.js');
  return readJSON(MOJ_LICENSES_PATH);
}

router.post('/verify-license', async (req, res) => {
  const { licenseNumber, name } = req.body;
  if (!licenseNumber) return res.status(400).json({ verified: false, error: 'License number is required' });

  const licenses = await getLicenses();
  const record   = licenses.find(l => l.licenseNumber === licenseNumber);

  if (!record) return res.status(404).json({ verified: false, error: 'License number not found in official MoJ database' });
  if (record.status !== 'ACTIVE') return res.status(400).json({ verified: false, error: 'License status is inactive or suspended' });
  if (name && record.fullName.toLowerCase().trim() !== name.toLowerCase().trim()) {
    return res.status(400).json({ verified: false, error: `License validation failed. Name on license is "${record.fullName}", but provided "${name}".` });
  }

  res.json({ verified: true, licenseRecord: record });
});

router.get('/licenses', async (req, res) => {
  try {
    res.json(await getLicenses());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
