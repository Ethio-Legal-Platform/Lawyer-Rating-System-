import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { mongoose } from '../lib/mongoose.js';
import { sendBrevoEmail } from '../services/emailService.js';

const router = Router();
const SALT_ROUNDS = 10;
const pendingRegistrations = {};

function getUserModel() {
  if (mongoose.connection.readyState === 1) {
    return import('../models/User.js').then(m => m.default);
  }
  return null;
}

router.post('/register', async (req, res) => {
  const {
    name, username, password, email, role,
    licenseNumber, specialization,
    city, phone, bio, yearsExperience, languages, education
  } = req.body;

  if (!name || !username || !password || !email || !role) {
    return res.status(400).json({ error: 'Name, username, password, email, and role are required' });
  }

  if (role === 'lawyer') {
    if (!licenseNumber || !specialization) {
      return res.status(400).json({ error: 'License number and specialization are required for lawyers' });
    }

    let licenseRecord;
    if (mongoose.connection.readyState === 1) {
      const MojLicense = (await import('../models/MojLicense.js')).default;
      licenseRecord = await MojLicense.findOne({ licenseNumber });
    } else {
      const { readJSON } = await import('../lib/db.js');
      const { MOJ_LICENSES_PATH } = await import('../config/paths.js');
      licenseRecord = readJSON(MOJ_LICENSES_PATH).find(l => l.licenseNumber === licenseNumber);
    }

    if (!licenseRecord) return res.status(400).json({ error: 'License number not found in official Ministry of Justice registry' });
    if (licenseRecord.status !== 'ACTIVE') return res.status(400).json({ error: 'License number is inactive or suspended in official MoJ registry' });
    if (licenseRecord.fullName.toLowerCase().trim() !== name.toLowerCase().trim()) {
      return res.status(400).json({ error: `MoJ License validation failed. Name on official license is "${licenseRecord.fullName}", not "${name}".` });
    }
  }

  let existingUser;
  if (mongoose.connection.readyState === 1) {
    const User = (await import('../models/User.js')).default;
    existingUser = await User.findOne({ $or: [{ username }, { email }] });
  } else {
    const { readJSON } = await import('../lib/db.js');
    const { USERS_PATH } = await import('../config/paths.js');
    existingUser = readJSON(USERS_PATH).find(u => u.username === username || u.email === email);
  }

  if (existingUser) return res.status(400).json({ error: 'Username or email already registered' });

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
      elo:             role === 'lawyer' ? 1000 : null,
      verified:        false,
    }
  };

  await sendBrevoEmail(email, code);
  res.status(200).json({ message: 'OTP sent to your email address.', otp_required: true, email });
});

router.post('/register-verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and OTP code are required' });

  const record = pendingRegistrations[email];
  if (!record || record.code !== code) return res.status(400).json({ error: 'Invalid or expired OTP code' });

  const newUser = { ...record.userData, verified: true };

  if (mongoose.connection.readyState === 1) {
    const User = (await import('../models/User.js')).default;
    await User.create(newUser);
  } else {
    const { readJSON, writeJSON } = await import('../lib/db.js');
    const { USERS_PATH } = await import('../config/paths.js');
    const users = readJSON(USERS_PATH);
    users.push(newUser);
    writeJSON(USERS_PATH, users);
  }

  delete pendingRegistrations[email];
  res.json({ message: 'Account verified and registered successfully. You can now login.' });
});

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

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  const cleanInput    = String(username).trim().toLowerCase();
  const cleanPassword = String(password).trim();

  let user;
  if (mongoose.connection.readyState === 1) {
    const User = (await import('../models/User.js')).default;
    user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${cleanInput}$`, 'i') } },
        { email:    { $regex: new RegExp(`^${cleanInput}$`, 'i') } },
      ]
    }).lean();
  } else {
    const { readJSON } = await import('../lib/db.js');
    const { USERS_PATH } = await import('../config/paths.js');
    user = readJSON(USERS_PATH).find(
      u => u.username?.toLowerCase().trim() === cleanInput ||
           u.email?.toLowerCase().trim()    === cleanInput
    );
  }

  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  let passwordMatch = false;
  if (user.password?.startsWith('$2')) {
    passwordMatch = await bcrypt.compare(password, user.password) ||
                    await bcrypt.compare(cleanPassword, user.password);
  } else {
    passwordMatch = user.password === password || user.password === cleanPassword;
  }

  if (!passwordMatch) return res.status(401).json({ error: 'Invalid username or password' });

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
