import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { readJSON, writeJSON } from '../lib/db.js';
import { USERS_PATH, MOJ_LICENSES_PATH } from '../config/paths.js';
import { sendBrevoEmail } from '../services/emailService.js';

const router = Router();
const SALT_ROUNDS = 10;

// In-memory store for pending (unverified) registrations
// { [email]: { code: string, userData: object } }
const pendingRegistrations = {};

// ── POST /api/auth/register ────────────────────────────────────────────────
// Validates MoJ license for lawyers, hashes password, generates OTP, sends verification email.
router.post('/register', async (req, res) => {
  const {
    name, username, password, email, role,
    licenseNumber, specialization,
    // Optional profile fields
    city, phone, bio, yearsExperience, languages, education
  } = req.body;

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

    const mojLicenses   = readJSON(MOJ_LICENSES_PATH);
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

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  pendingRegistrations[email] = {
    code,
    userData: {
      id: `${role}-${Date.now()}`,
      name, username, email, role,
      password: hashedPassword,
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      licenseNumber:   role === 'lawyer' ? licenseNumber  : null,
      specialization:  role === 'lawyer' ? specialization : null,
      city:            city            || null,
      phone:           phone           || null,
      bio:             bio             || null,
      yearsExperience: yearsExperience ? Number(yearsExperience) : null,
      languages:       Array.isArray(languages) ? languages : (languages ? [languages] : []),
      education:       education       || null,
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

// ── POST /api/auth/resend-otp ─────────────────────────────────────────────
// Regenerates and resends OTP for a pending registration.
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const record = pendingRegistrations[email];
  if (!record) return res.status(404).json({ error: 'No pending registration found for this email' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  pendingRegistrations[email].code = code;
  await sendBrevoEmail(email, code);
  res.json({ message: 'A new verification code has been sent to your email.' });
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
// Authenticates a user by username/email + password using bcrypt and returns a JWT token.
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const cleanInput = String(username).trim().toLowerCase();
  const cleanPassword = String(password).trim();

  const users = readJSON(USERS_PATH);
  const user  = users.find(
    u => (u.username && u.username.toLowerCase().trim() === cleanInput) ||
         (u.email && u.email.toLowerCase().trim() === cleanInput)
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  let passwordMatch = false;
  if (user.password) {
    if (user.password.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, user.password) ||
                      await bcrypt.compare(cleanPassword, user.password);
    } else {
      passwordMatch = (user.password === password) || (user.password === cleanPassword);
    }
  }

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, licenseNumber: user.licenseNumber || null },
    process.env.JWT_SECRET || 'dev_secret_key_123456789_lex_rating',
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful',
    token,
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
