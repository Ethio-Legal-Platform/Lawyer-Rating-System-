import { Router } from 'express';
import { readJSON, writeJSON } from '../lib/db.js';
import { USERS_PATH, MOJ_LICENSES_PATH } from '../config/paths.js';
import { sendBrevoEmail } from '../services/emailService.js';

const router = Router();

// In-memory store for pending (unverified) registrations
// { [email]: { code: string, userData: object } }
const pendingRegistrations = {};

// ── POST /api/auth/register ────────────────────────────────────────────────
// Validates MoJ license for lawyers, generates OTP, sends verification email.
router.post('/register', async (req, res) => {
  const { name, username, password, email, role, licenseNumber, specialization } = req.body;

  if (!name || !username || !password || !email || !role) {
    return res.status(400).json({ error: 'Name, username, password, email, and role are required' });
  }

  const users = readJSON(USERS_PATH);

  if (users.some(u => u.username === username || u.email === email)) {
    return res.status(400).json({ error: 'Username or email already registered' });
  }

  // Lawyers must have a valid, active MoJ license whose name matches
  if (role === 'lawyer') {
    if (!licenseNumber || !specialization) {
      return res.status(400).json({ error: 'License number and specialization are required for lawyers' });
    }

    const mojLicenses  = readJSON(MOJ_LICENSES_PATH);
    const licenseRecord = mojLicenses.find(l => l.licenseNumber === licenseNumber);

    if (!licenseRecord) {
      return res.status(400).json({ error: 'License number not found in official Ministry of Justice registry' });
    }
    if (licenseRecord.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'License number is inactive or suspended in official MoJ registry' });
    }
    if (licenseRecord.fullName.toLowerCase().trim() !== name.toLowerCase().trim()) {
      return res.status(400).json({
        error: `MoJ License validation failed. Name on official license is "${licenseRecord.fullName}", not "${name}".`
      });
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  pendingRegistrations[email] = {
    code,
    userData: {
      id: `${role}-${Date.now()}`,
      name, username, password, email, role,
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      licenseNumber:  role === 'lawyer' ? licenseNumber  : null,
      specialization: role === 'lawyer' ? specialization : null,
      elo: role === 'lawyer' ? 1000 : null,
      verified: false
    }
  };

  await sendBrevoEmail(email, code);

  res.status(200).json({ message: 'OTP sent to your email address.', otp_required: true, email });
});

// ── POST /api/auth/register-verify ────────────────────────────────────────
// Confirms OTP and persists the new user to disk.
router.post('/register-verify', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and OTP code are required' });
  }

  const record = pendingRegistrations[email];
  if (!record || record.code !== code) {
    return res.status(400).json({ error: 'Invalid or expired OTP code' });
  }

  const users   = readJSON(USERS_PATH);
  const newUser = { ...record.userData, verified: true };
  users.push(newUser);
  writeJSON(USERS_PATH, users);

  delete pendingRegistrations[email];

  res.json({ message: 'Account verified and registered successfully. You can now login.' });
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
// Authenticates a user by username/email + password.
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = readJSON(USERS_PATH);
  const user  = users.find(
    u => (u.username === username || u.email === username) && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    message: 'Login successful',
    user: {
      id:         user.id,
      name:       user.name,
      username:   user.username,
      email:      user.email,
      role:       user.role,
      profilePic: user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    }
  });
});

export default router;
