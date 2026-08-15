import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import SibApiV3Sdk from 'sib-api-v3-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DATA_DIR = path.join(__dirname, 'data');

// Separated Local Databases
const USERS_PATH = path.join(DATA_DIR, 'users.json');
const MOJ_LICENSES_PATH = path.join(DATA_DIR, 'moj_licenses.json');
const COURT_CASES_PATH = path.join(DATA_DIR, 'court_cases.json');

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory store for pending registrations
const pendingRegistrations = {};

// Ensure JSON files exist and read them
function readJSON(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Failed to write to ${filePath}:`, err);
  }
}

// Send Verification Email via Brevo API SDK
async function sendBrevoEmail(toEmail, code) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@lexrating.gov.ae';
  const senderName = process.env.BREVO_SENDER_NAME || 'LEX-RATING System';

  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    console.warn('\n⚠️ WARNING: Brevo API Key not configured in .env. Email was NOT sent to inbox.');
    console.log(`=== MOCK OTP LOG ===\nOTP for ${toEmail}: ${code}\n====================\n`);
    return false;
  }

  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Your verification code";
    sendSmtpEmail.textContent = `Your verification code is ${code}`;
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [ { email: toEmail } ];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`\n📧 Real email successfully sent via Brevo SDK to: ${toEmail}. Message ID: ${data.messageId}\n`);
    return true;
  } catch (err) {
    console.error('Brevo SDK request failed:', err);
  }
  return false;
}

// ----------------------------------------------------
// AUTOMATIC REAL-TIME RATING & ELO UPDATE ALGORITHM
// Updates lawyer rating automatically whenever a new case with their ID is registered
// Stores wins/losses for future analytical usage while computing real-time ratings
// ----------------------------------------------------
function calculateLawyerRatings(users, courtCases) {
  const eloMap = {};
  const statsMap = {};

  // Base ELO = 1000 for all lawyers
  users.forEach(u => {
    if (u.role === 'lawyer') {
      eloMap[u.licenseNumber] = 1000;
      statsMap[u.licenseNumber] = {
        casesWon: 0,
        casesLost: 0,
        totalCases: 0,
        ratings: []
      };
    }
  });

  const K = 32;

  courtCases.forEach(c => {
    // Process Plaintiff Lawyer side
    if (c.plaintiffLawyerLicense) {
      const lic = c.plaintiffLawyerLicense;
      if (!eloMap[lic]) eloMap[lic] = 1000;
      if (!statsMap[lic]) statsMap[lic] = { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };

      const jRating = typeof c.judgeRatingPlaintiff === 'number' ? c.judgeRatingPlaintiff : 5.0;
      const cRating = typeof c.clientRatingPlaintiff === 'number' ? c.clientRatingPlaintiff : jRating;
      const caseScore = (jRating + cRating) / 2.0;

      statsMap[lic].ratings.push(jRating, cRating);
      statsMap[lic].totalCases += 1;

      // Track win/loss for future reference
      if (c.verdict === 'Plaintiff') statsMap[lic].casesWon += 1;
      else if (c.verdict === 'Defendant') statsMap[lic].casesLost += 1;

      // Real-time automatic ELO update using performance rating formula
      eloMap[lic] = Math.round(eloMap[lic] + K * (caseScore - 3.5));
    }

    // Process Defendant Lawyer side
    if (c.defendantLawyerLicense) {
      const lic = c.defendantLawyerLicense;
      if (!eloMap[lic]) eloMap[lic] = 1000;
      if (!statsMap[lic]) statsMap[lic] = { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };

      const jRating = typeof c.judgeRatingDefendant === 'number' ? c.judgeRatingDefendant : 4.0;
      const cRating = typeof c.clientRatingDefendant === 'number' ? c.clientRatingDefendant : jRating;
      const caseScore = (jRating + cRating) / 2.0;

      statsMap[lic].ratings.push(jRating, cRating);
      statsMap[lic].totalCases += 1;

      // Track win/loss for future reference
      if (c.verdict === 'Defendant') statsMap[lic].casesWon += 1;
      else if (c.verdict === 'Plaintiff') statsMap[lic].casesLost += 1;

      // Real-time automatic ELO update using performance rating formula
      eloMap[lic] = Math.round(eloMap[lic] + K * (caseScore - 3.5));
    }
  });

  return { eloMap, statsMap };
}

// ----------------------------------------------------
// 1. MINISTRY OF JUSTICE (MoJ) LICENSE API SERVICE
// ----------------------------------------------------

// Verify license number & practitioner name against official MoJ registry
app.post('/api/moj/verify-license', (req, res) => {
  const { licenseNumber, name } = req.body;
  if (!licenseNumber) {
    return res.status(400).json({ verified: false, error: 'License number is required' });
  }

  const mojLicenses = readJSON(MOJ_LICENSES_PATH);
  const licenseRecord = mojLicenses.find(l => l.licenseNumber === licenseNumber);

  if (!licenseRecord) {
    return res.status(404).json({ verified: false, error: 'License number not found in official MoJ database' });
  }

  if (licenseRecord.status !== 'ACTIVE') {
    return res.status(400).json({ verified: false, error: 'License status is inactive or suspended' });
  }

  // Check matching associated name if provided
  if (name && licenseRecord.fullName.toLowerCase().trim() !== name.toLowerCase().trim()) {
    return res.status(400).json({
      verified: false,
      error: `License validation failed. Name on license is registered as "${licenseRecord.fullName}", but provided "${name}".`
    });
  }

  return res.json({
    verified: true,
    licenseRecord
  });
});

// List official MoJ licenses
app.get('/api/moj/licenses', (req, res) => {
  const licenses = readJSON(MOJ_LICENSES_PATH);
  res.json(licenses);
});

// ----------------------------------------------------
// 2. JUDICIAL COURT SYSTEM API SERVICE (Real-time Rating Engine)
// ----------------------------------------------------

// Fetch rating & ELO stats for a lawyer by license number
app.get('/api/court/lawyer-rating/:licenseNumber', (req, res) => {
  const { licenseNumber } = req.params;
  const users = readJSON(USERS_PATH);
  const courtCases = readJSON(COURT_CASES_PATH);

  const { eloMap, statsMap } = calculateLawyerRatings(users, courtCases);
  const elo = eloMap[licenseNumber] || 1000;
  const stats = statsMap[licenseNumber] || { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };

  const avgStarRating = stats.ratings.length > 0
    ? parseFloat((stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1))
    : 5.0;

  res.json({
    licenseNumber,
    elo,
    casesWon: stats.casesWon,
    casesLost: stats.casesLost,
    totalCases: stats.totalCases,
    averageRating: avgStarRating
  });
});

// Get all court cases
app.get('/api/court/cases', (req, res) => {
  const cases = readJSON(COURT_CASES_PATH);
  res.json(cases);
});

// Register a new court case (Stores verdict for future analytics, updates ratings real-time)
app.post('/api/court/cases', (req, res) => {
  const {
    caseTitle,
    caseType,
    judgeId,
    judgeName,
    plaintiffClientId,
    plaintiffClientName,
    plaintiffLawyerLicense,
    plaintiffLawyerName,
    judgeRatingPlaintiff,
    clientRatingPlaintiff,
    defendantClientId,
    defendantClientName,
    defendantLawyerLicense,
    defendantLawyerName,
    judgeRatingDefendant,
    clientRatingDefendant,
    verdict
  } = req.body;

  if (!plaintiffLawyerLicense && !defendantLawyerLicense) {
    return res.status(400).json({ error: 'At least one lawyer license ID is required to register a case' });
  }

  const courtCases = readJSON(COURT_CASES_PATH);
  const newCase = {
    caseId: `CASE-2026-${String(courtCases.length + 1).padStart(3, '0')}`,
    caseTitle: caseTitle || 'Judicial Case Proceeding',
    caseType: caseType || 'Civil',
    dateDecided: new Date().toISOString().split('T')[0],
    judgeId: judgeId || 'JUDGE-GOV-001',
    judgeName: judgeName || 'Hon. Presiding Judge',
    
    plaintiffClientId: plaintiffClientId || 'client-1',
    plaintiffClientName: plaintiffClientName || 'Plaintiff Litigant',
    plaintiffLawyerLicense: plaintiffLawyerLicense || null,
    plaintiffLawyerName: plaintiffLawyerName || 'Plaintiff Advocate',
    judgeRatingPlaintiff: judgeRatingPlaintiff !== undefined ? Number(judgeRatingPlaintiff) : 5.0,
    clientRatingPlaintiff: clientRatingPlaintiff !== undefined ? Number(clientRatingPlaintiff) : 5.0,
    
    defendantClientId: defendantClientId || 'client-2',
    defendantClientName: defendantClientName || 'Defendant Litigant',
    defendantLawyerLicense: defendantLawyerLicense || null,
    defendantLawyerName: defendantLawyerName || 'Defendant Advocate',
    judgeRatingDefendant: judgeRatingDefendant !== undefined ? Number(judgeRatingDefendant) : 4.0,
    clientRatingDefendant: clientRatingDefendant !== undefined ? Number(clientRatingDefendant) : 4.0,

    verdict: verdict || 'Decided' // Preserved for future analytical use
  };

  courtCases.push(newCase);
  writeJSON(COURT_CASES_PATH, courtCases);
  res.status(201).json({ message: 'Case registered. Real-time ratings updated and verdict stored for analytics.', case: newCase });
});

// ----------------------------------------------------
// 3. LEX-RATING PLATFORM API ENDPOINTS
// ----------------------------------------------------

// SEARCH LAWYERS BY SPECIALIZATION & COMPUTE REAL-TIME RATING
app.get('/api/lawyers/search', (req, res) => {
  const query = (req.query.specialization || '').toLowerCase().trim();
  const users = readJSON(USERS_PATH);
  const courtCases = readJSON(COURT_CASES_PATH);

  // Real-time automatic rating computation across all court cases
  const { eloMap, statsMap } = calculateLawyerRatings(users, courtCases);

  // Filter verified lawyer users
  const matchingLawyers = users.filter(u =>
    u.role === 'lawyer' &&
    u.verified === true &&
    (query === '' || (u.specialization && u.specialization.toLowerCase().includes(query)))
  );

  // Return lawyers with real-time ELO, star rating, and stored stats
  const results = matchingLawyers.map(l => {
    const elo = eloMap[l.licenseNumber] || 1000;
    const stats = statsMap[l.licenseNumber] || { casesWon: 0, casesLost: 0, totalCases: 0, ratings: [] };

    const avgStarRating = stats.ratings.length > 0
      ? parseFloat((stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1))
      : 5.0;

    return {
      id: l.id,
      name: l.name,
      specialization: l.specialization,
      licenseNumber: l.licenseNumber,
      profilePic: l.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      elo,
      rating: avgStarRating,
      casesCount: stats.totalCases,
      casesWon: stats.casesWon,
      casesLost: stats.casesLost
    };
  });

  // Sort by ELO score descending
  results.sort((a, b) => b.elo - a.elo);

  res.json(results);
});

// LAWYER REGISTRATION (Authenticates via MoJ License API)
app.post('/api/auth/register', async (req, res) => {
  const { name, username, password, email, role, licenseNumber, specialization } = req.body;
  if (!name || !username || !password || !email || !role) {
    return res.status(400).json({ error: 'Name, username, password, email, and role are required' });
  }

  const users = readJSON(USERS_PATH);

  // Check if username/email already taken
  const userExists = users.some(u => u.username === username || u.email === email);
  if (userExists) {
    return res.status(400).json({ error: 'Username or email already registered' });
  }

  // Lawyer Validation against MoJ License API Service
  if (role === 'lawyer') {
    if (!licenseNumber || !specialization) {
      return res.status(400).json({ error: 'License number and specialization are required for lawyers' });
    }

    const mojLicenses = readJSON(MOJ_LICENSES_PATH);
    const licenseRecord = mojLicenses.find(l => l.licenseNumber === licenseNumber);

    if (!licenseRecord) {
      return res.status(400).json({ error: 'License number not found in official Ministry of Justice registry' });
    }

    if (licenseRecord.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'License number is inactive or suspended in official MoJ registry' });
    }

    // Verify name on license matches registered name (case-insensitive)
    if (licenseRecord.fullName.toLowerCase().trim() !== name.toLowerCase().trim()) {
      return res.status(400).json({
        error: `MoJ License validation failed. Name on official license is registered as "${licenseRecord.fullName}", not "${name}".`
      });
    }
  }

  // Generate 6-digit OTP for registration verification
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const pendingUser = {
    id: `${role}-${Date.now()}`,
    name,
    username,
    password,
    email,
    role,
    profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    licenseNumber: role === 'lawyer' ? licenseNumber : null,
    specialization: role === 'lawyer' ? specialization : null,
    elo: role === 'lawyer' ? 1000 : null,
    verified: false
  };

  // Save to pending registrations
  pendingRegistrations[email] = { code, userData: pendingUser };

  // Dispatch real email via Brevo
  await sendBrevoEmail(email, code);

  res.status(200).json({
    message: 'OTP sent to your email address.',
    otp_required: true,
    email
  });
});

// VERIFY REGISTRATION OTP
app.post('/api/auth/register-verify', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and OTP code are required' });
  }

  const record = pendingRegistrations[email];
  if (!record || record.code !== code) {
    return res.status(400).json({ error: 'Invalid or expired OTP code' });
  }

  // Mark verified and save to users database
  const users = readJSON(USERS_PATH);
  const newUser = record.userData;
  newUser.verified = true;

  users.push(newUser);
  writeJSON(USERS_PATH, users);

  delete pendingRegistrations[email];

  res.json({ message: 'Account verified and registered successfully. You can now login.' });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = readJSON(USERS_PATH);
  const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`LEX-RATING Server running on port ${PORT}`);
  console.log(`MoJ License Verification API: http://localhost:${PORT}/api/moj/verify-license`);
  console.log(`Judicial Court System API: http://localhost:${PORT}/api/court/cases`);
});
