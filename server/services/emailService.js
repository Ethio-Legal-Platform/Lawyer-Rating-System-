import { Router } from 'express';
import { readJSON } from '../lib/db.js';
import { MOJ_LICENSES_PATH } from '../config/paths.js';

const router = Router();

// ── POST /api/moj/verify-license ──────────────────────────────────────────
// Verifies a lawyer's license number (and optionally their registered name)
// against the official Ministry of Justice registry.
router.post('/verify-license', (req, res) => {
  const { licenseNumber, name } = req.body;

  if (!licenseNumber) {
    return res.status(400).json({ verified: false, error: 'License number is required' });
  }

  const mojLicenses   = readJSON(MOJ_LICENSES_PATH);
  const licenseRecord = mojLicenses.find(l => l.licenseNumber === licenseNumber);

  if (!licenseRecord) {
    return res.status(404).json({ verified: false, error: 'License number not found in official MoJ database' });
  }

  if (licenseRecord.status !== 'ACTIVE') {
    return res.status(400).json({ verified: false, error: 'License status is inactive or suspended' });
  }

  if (name && licenseRecord.fullName.toLowerCase().trim() !== name.toLowerCase().trim()) {
    return res.status(400).json({
      verified: false,
      error: `License validation failed. Name on license is "${licenseRecord.fullName}", but provided "${name}".`
    });
  }

  res.json({ verified: true, licenseRecord });
});
