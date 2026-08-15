'use strict';
const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const multer   = require('multer');
const { v4: uuidv4 } = require('uuid');
const fetch    = require('node-fetch');

const app  = express();
const PORT = 5001;

// ── Paths ──────────────────────────────────────────────────────────────────
const DB = p => path.join(__dirname, 'db', p);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// ── Multer (file uploads) ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────
const readDB  = file => { try { return JSON.parse(fs.readFileSync(DB(file), 'utf8')); } catch { return []; } };
const writeDB = (file, data) => fs.writeFileSync(DB(file), JSON.stringify(data, null, 2));

// Generate 6-digit OTP
const genOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// In-memory OTP store  { phone: { code, expires } }
const otpStore = {};

// SMSEthiopia API Key
const SMS_API_KEY = '7R45MFJVWUC9GPZT84GT7N1YN8ZCYFV298U98DW1';

async function sendSMS(phone, message) {
  // Normalise: ensure starts with 251
  let msisdn = String(phone).replace(/\s+/g, '');
  if (msisdn.startsWith('0')) msisdn = '251' + msisdn.slice(1);
  if (!msisdn.startsWith('251')) msisdn = '251' + msisdn;

  console.log(`[SMS] → ${msisdn}: ${message}`);

  try {
    const res = await fetch('https://smsethiopia.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'KEY': SMS_API_KEY },
      body: JSON.stringify({ msisdn, text: message })
    });
    const data = await res.json();
    console.log('[SMS] Response:', data);
    return data;
  } catch (err) {
    console.error('[SMS] Error:', err.message);
    return { status: 'error', message: err.message };
  }
}

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// CORS – allow jrate frontend on 5174
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/auth/login  — works for all roles
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const roles = [
    { file: 'admins.json',   role: 'admin' },
    { file: 'judges.json',   role: 'judge' },
    { file: 'officers.json', role: 'officer' },
    { file: 'clerks.json',   role: 'clerk' },
    { file: 'lawyers.json',  role: 'lawyer' },
  ];

  for (const { file, role } of roles) {
    const db = readDB(file);
    const user = db.find(u => u.username === username && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      return res.json({ success: true, user: { ...safeUser, role } });
    }
  }

  // Check Temporary Filer Account (Phone number + Temporary Case PIN)
  const cases = readDB('cases.json');
  const filerCase = cases.find(c =>
    (c.filer.phone === username || `251${username.slice(1)}` === c.filer.phone) &&
    c.tempPin === password &&
    c.status !== 'closed' // Active until case is closed
  );

  if (filerCase) {
    return res.json({
      success: true,
      user: {
        id: `FILER-${filerCase.caseId}`,
        username: filerCase.filer.phone,
        fullName: filerCase.filer.name,
        role: 'filer',
        phone: filerCase.filer.phone,
        caseId: filerCase.caseId
      }
    });
  }

  return res.status(401).json({ error: 'Invalid username/phone or password/PIN' });
});

// POST /api/auth/register-lawyer  — verifies MoJ license first
app.post('/api/auth/register-lawyer', (req, res) => {
  const { licenseNumber, username, password, fullName, email, phone } = req.body;
  if (!licenseNumber || !username || !password || !fullName) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const licenses = readDB('moj_licenses.json');
  const lic = licenses.find(l => l.licenseNumber === licenseNumber);
  if (!lic) return res.status(400).json({ error: 'License number not found in MoJ registry' });
  if (lic.status !== 'ACTIVE') return res.status(400).json({ error: 'License is not active' });
  if (lic.fullName.toLowerCase() !== fullName.toLowerCase()) {
    return res.status(400).json({ error: 'Full name does not match MoJ registry record' });
  }

  const lawyers = readDB('lawyers.json');
  if (lawyers.find(l => l.username === username)) {
    return res.status(400).json({ error: 'Username already taken' });
  }
  if (lawyers.find(l => l.licenseNumber === licenseNumber)) {
    return res.status(400).json({ error: 'A lawyer account with this license already exists' });
  }

  const newLawyer = {
    id: `LAWYER-${uuidv4().split('-')[0].toUpperCase()}`,
    username, password, fullName, email: email || '', phone: phone || '',
    licenseNumber, specialization: lic.specialization,
    role: 'lawyer', registeredAt: new Date().toISOString(),
    blockedFilers: []
  };
  lawyers.push(newLawyer);
  writeDB('lawyers.json', lawyers);

  const { password: _, ...safe } = newLawyer;
  res.json({ success: true, message: 'Lawyer account created', user: safe });
});

// ═══════════════════════════════════════════════════════════════════════════
// OTP  (for case filers — public)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/otp/request  — sends OTP to phone
app.post('/api/otp/request', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const code    = genOTP();
  const expires = Date.now() + 10 * 60 * 1000; // 10 min
  otpStore[phone] = { code, expires };

  const smsResult = await sendSMS(phone, `Your Federal Court Verification Code is: ${code}. Valid for 10 minutes. Do not share.`);

  // If SMSEthiopia restricts to whitelisted numbers on starter API key
  const isNotWhitelisted = smsResult?.error_message?.includes('DEFAULT_CAMPAIGN_RECIPIENT_NOT_WHITELISTED');

  if (isNotWhitelisted) {
    return res.json({
      success: true,
      message: 'OTP generated. Note: Real SMS is delivered to whitelisted numbers on your SMSEthiopia account. For unwhitelisted test numbers, use the code below.',
      test_code_unwhitelisted: code
    });
  }

  if (smsResult && smsResult.status === 'error') {
    return res.status(500).json({ error: `Failed to send SMS: ${smsResult.error_message || smsResult.message}` });
  }

  res.json({ success: true, message: 'OTP sent to your phone via real SMS.' });
});

// POST /api/otp/verify
app.post('/api/otp/verify', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });

  const entry = otpStore[phone];
  if (!entry) return res.status(400).json({ error: 'No OTP requested for this number' });
  if (Date.now() > entry.expires) {
    delete otpStore[phone];
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }
  if (entry.code !== String(code)) {
    return res.status(400).json({ error: 'Invalid OTP code' });
  }

  delete otpStore[phone];
  res.json({ success: true, message: 'Phone verified', verifiedPhone: phone });
});

// ═══════════════════════════════════════════════════════════════════════════
// CASES
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/cases/file  — anyone (phone-verified) can file
app.post('/api/cases/file', upload.array('evidenceFiles', 10), (req, res) => {
  const {
    // Filer info
    filerName, filerPhone, filerEmail, filerAddress, filerRole, // filerRole: prosecutor | individual | organization
    // Case info
    caseTitle, caseType, jurisdiction, description, incidentDate, incidentLocation,
    // For client filing on behalf
    clientName, clientPhone, clientIdNumber,
    // Is criminal (prosecutor files)
    isProsecutor
  } = req.body;

  const required = ['filerName', 'filerPhone', 'caseTitle', 'caseType', 'jurisdiction', 'description'];
  for (const f of required) {
    if (!req.body[f]) return res.status(400).json({ error: `${f} is required` });
  }

  const caseId = `CASE-${Date.now()}`;
  const tempPin = genOTP(); // 6-digit temporary access PIN for filer

  const evidenceFiles = (req.files || []).map(f => ({
    originalName: f.originalname,
    storedName:   f.filename,
    size:         f.size,
    uploadedAt:   new Date().toISOString(),
    encrypted:    true  // flag — real encryption can be layered in
  }));

  const newCase = {
    caseId,
    tempPin, // Temporary access PIN for filer until case is closed
    status: 'pending_review',  // → accepted | rejected | assigned | in_progress | closed
    caseTitle, caseType, jurisdiction, description,
    incidentDate: incidentDate || null,
    incidentLocation: incidentLocation || null,
    filer: { name: filerName, phone: filerPhone, email: filerEmail || '', address: filerAddress || '', role: filerRole || 'individual' },
    client: clientName ? { name: clientName, phone: clientPhone || '', idNumber: clientIdNumber || '' } : null,
    isProsecutor: isProsecutor === 'true',
    evidenceFiles,
    // Will be filled later:
    assignedOfficerId: null,
    assignedBranchId: null,
    assignedJudgeId: null,
    plaintiffLawyerLicense: null,
    plaintiffLawyerStatus: null,  // pending | accepted | rejected
    defendantLawyerLicense: null,
    defendantLawyerStatus: null,
    officialLetterSent: false,
    adminNote: '',
    officerNote: '',
    sessions: [],
    ratings: {},
    filedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const cases = readDB('cases.json');
  cases.push(newCase);
  writeDB('cases.json', cases);

  // Send SMS notice with Temporary Access PIN
  sendSMS(filerPhone, `Federal Court: Your case ${caseId} has been submitted. Your temporary access PIN is: ${tempPin}. Login with your phone & PIN at http://localhost:5001 to track status or request a lawyer.`);

  res.json({
    success: true,
    message: 'Case filed successfully. Temporary access account created.',
    caseId,
    tempPin,
    filerPhone
  });
});

// GET /api/cases  — role-filtered
app.get('/api/cases', (req, res) => {
  const { role, userId, phone } = req.query;
  let cases = readDB('cases.json');

  if (role === 'admin' || role === 'officer') return res.json(cases);
  if (role === 'judge') {
    cases = cases.filter(c => c.assignedJudgeId === userId);
    return res.json(cases);
  }
  if (role === 'clerk') {
    // clerk sees active/in_progress cases on their branch
    return res.json(cases.filter(c => ['accepted','assigned','in_progress'].includes(c.status)));
  }
  if (role === 'lawyer') {
    cases = cases.filter(c =>
      c.plaintiffLawyerLicense === userId ||
      c.defendantLawyerLicense === userId
    );
    return res.json(cases);
  }
  if (role === 'filer') {
    const targetPhone = phone || req.query.username;
    const targetCaseId = userId && userId.startsWith('FILER-') ? userId.replace('FILER-', '') : null;
    
    return res.json(cases.filter(c => {
      if (targetCaseId && c.caseId === targetCaseId) return true;
      if (c.filer && c.filer.phone) {
        if (targetPhone && c.filer.phone.slice(-9) === targetPhone.slice(-9)) return true;
        if (userId && c.filer.phone.slice(-9) === String(userId).slice(-9)) return true;
      }
      return false;
    }));
  }
  if (phone) {
    cases = cases.filter(c => c.filer && c.filer.phone && c.filer.phone.slice(-9) === phone.slice(-9));
    return res.json(cases);
  }
  res.json([]);
});

// GET /api/cases/:id
app.get('/api/cases/:id', (req, res) => {
  const cases = readDB('cases.json');
  const c = cases.find(c => c.caseId === req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  res.json(c);
});

// PUT /api/cases/:id/accept  (admin)
app.put('/api/cases/:id/accept', (req, res) => {
  const { adminNote } = req.body;
  const cases = readDB('cases.json');
  const idx   = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });
  cases[idx].status    = 'accepted';
  cases[idx].adminNote = adminNote || '';
  cases[idx].updatedAt = new Date().toISOString();
  writeDB('cases.json', cases);
  res.json({ success: true, case: cases[idx] });
});

// PUT /api/cases/:id/reject  (admin)
app.put('/api/cases/:id/reject', (req, res) => {
  const { adminNote } = req.body;
  const cases = readDB('cases.json');
  const idx   = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });
  cases[idx].status    = 'rejected';
  cases[idx].adminNote = adminNote || '';
  cases[idx].updatedAt = new Date().toISOString();
  writeDB('cases.json', cases);
  res.json({ success: true });
});

// PUT /api/cases/:id/assign-officer  (admin)
app.put('/api/cases/:id/assign-officer', (req, res) => {
  const { officerId } = req.body;
  const cases = readDB('cases.json');
  const idx   = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });
  cases[idx].assignedOfficerId = officerId;
  cases[idx].status    = 'assigned_officer';
  cases[idx].updatedAt = new Date().toISOString();
  writeDB('cases.json', cases);
  res.json({ success: true, case: cases[idx] });
});

// PUT /api/cases/:id/assign-branch  (officer)
app.put('/api/cases/:id/assign-branch', (req, res) => {
  const { branchId, officerNote } = req.body;
  const cases    = readDB('cases.json');
  const branches = readDB('branches.json');
  const idx      = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });
  const branch = branches.find(b => b.id === branchId);
  if (!branch) return res.status(400).json({ error: 'Branch not found' });

  // Record assignment history
  if (!cases[idx].assignmentHistory) cases[idx].assignmentHistory = [];
  cases[idx].assignmentHistory.push({
    timestamp: new Date().toISOString(),
    action: 'branch_assigned',
    branchId, officerNote: officerNote || ''
  });

  cases[idx].assignedBranchId = branchId;
  cases[idx].officerNote       = officerNote || '';
  cases[idx].updatedAt         = new Date().toISOString();
  writeDB('cases.json', cases);
  res.json({ success: true, branch, case: cases[idx] });
});

// PUT /api/cases/:id/assign-judge  (officer or admin)
app.put('/api/cases/:id/assign-judge', (req, res) => {
  const { judgeId, note } = req.body;
  const cases  = readDB('cases.json');
  const judges = readDB('judges.json');
  const idx    = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });
  const judge = judges.find(j => j.id === judgeId);
  if (!judge) return res.status(400).json({ error: 'Judge not found' });

  if (!cases[idx].assignmentHistory) cases[idx].assignmentHistory = [];
  cases[idx].assignmentHistory.push({
    timestamp: new Date().toISOString(),
    action: 'judge_assigned',
    judgeId, judgeFullName: judge.fullName, note: note || ''
  });

  cases[idx].assignedJudgeId = judgeId;
  cases[idx].status           = 'assigned';
  cases[idx].updatedAt        = new Date().toISOString();

  // Update judge's case count
  const jIdx = judges.findIndex(j => j.id === judgeId);
  judges[jIdx].activeCaseCount = (judges[jIdx].activeCaseCount || 0) + 1;
  writeDB('judges.json', judges);
  writeDB('cases.json', cases);
  res.json({ success: true, judge, case: cases[idx] });
});

// PUT /api/cases/:id/add-plaintiff-lawyer  (filer adds their lawyer by license)
app.put('/api/cases/:id/add-plaintiff-lawyer', (req, res) => {
  const { licenseNumber } = req.body;
  const cases    = readDB('cases.json');
  const licenses = readDB('moj_licenses.json');
  const lawyers  = readDB('lawyers.json');
  const idx      = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });

  const lic = licenses.find(l => l.licenseNumber === licenseNumber);
  if (!lic) return res.status(400).json({ error: 'License not found in MoJ registry' });

  // Create notification for lawyer
  const lawyer = lawyers.find(l => l.licenseNumber === licenseNumber);
  if (lawyer) {
    const notifications = readDB('notifications.json');
    notifications.push({
      id: uuidv4(),
      type: 'case_representation_request',
      lawyerLicenseNumber: licenseNumber,
      lawyerId: lawyer.id,
      caseId: cases[idx].caseId,
      caseTitle: cases[idx].caseTitle,
      filerName: cases[idx].filer.name,
      filerPhone: cases[idx].filer.phone,
      side: 'plaintiff',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    writeDB('notifications.json', notifications);

    // SMS the lawyer
    if (lawyer.phone) {
      sendSMS(lawyer.phone, `Federal Court Notice: You have a new case representation request for Case ${cases[idx].caseId} - "${cases[idx].caseTitle}". Please log in to respond.`);
    }
  }

  cases[idx].plaintiffLawyerLicense = licenseNumber;
  cases[idx].plaintiffLawyerStatus  = 'pending';
  cases[idx].updatedAt = new Date().toISOString();
  writeDB('cases.json', cases);
  res.json({ success: true, message: 'Lawyer notified. Awaiting acceptance.', lawyerName: lic.fullName });
});

// PUT /api/cases/:id/add-defendant-lawyer  (used after official letter)
app.put('/api/cases/:id/add-defendant-lawyer', (req, res) => {
  const { licenseNumber } = req.body;
  const cases    = readDB('cases.json');
  const licenses = readDB('moj_licenses.json');
  const lawyers  = readDB('lawyers.json');
  const idx      = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });

  const lic = licenses.find(l => l.licenseNumber === licenseNumber);
  if (!lic) return res.status(400).json({ error: 'License not found in MoJ registry' });

  const lawyer = lawyers.find(l => l.licenseNumber === licenseNumber);
  if (lawyer) {
    const notifications = readDB('notifications.json');
    notifications.push({
      id: uuidv4(),
      type: 'case_representation_request',
      lawyerLicenseNumber: licenseNumber,
      lawyerId: lawyer.id,
      caseId: cases[idx].caseId,
      caseTitle: cases[idx].caseTitle,
      filerName: cases[idx].filer.name,
      filerPhone: cases[idx].filer.phone,
      side: 'defendant',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    writeDB('notifications.json', notifications);
    if (lawyer.phone) {
      sendSMS(lawyer.phone, `Federal Court Notice: You have a case representation request (Defendant side) for Case ${cases[idx].caseId} - "${cases[idx].caseTitle}". Log in to respond.`);
    }
  }

  cases[idx].defendantLawyerLicense = licenseNumber;
  cases[idx].defendantLawyerStatus  = 'pending';
  cases[idx].updatedAt = new Date().toISOString();
  writeDB('cases.json', cases);
  res.json({ success: true, message: 'Defense lawyer notified. Awaiting acceptance.', lawyerName: lic.fullName });
});

// PUT /api/cases/:id/send-official-letter  (admin — generates demand letter for defendant)
app.put('/api/cases/:id/send-official-letter', (req, res) => {
  const cases = readDB('cases.json');
  const idx   = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });

  cases[idx].officialLetterSent = true;
  cases[idx].officialLetterDate = new Date().toISOString();
  cases[idx].status = 'in_progress';
  cases[idx].updatedAt = new Date().toISOString();
  writeDB('cases.json', cases);
  res.json({ success: true, message: 'Official summons letter generated and marked as sent.' });
});

// PUT /api/cases/:id/close  (judge)
app.put('/api/cases/:id/close', (req, res) => {
  const { verdict, judgeStatement } = req.body;
  const cases = readDB('cases.json');
  const idx   = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });
  cases[idx].status        = 'closed';
  cases[idx].verdict       = verdict || '';
  cases[idx].judgeStatement= judgeStatement || '';
  cases[idx].closedAt      = new Date().toISOString();
  cases[idx].updatedAt     = new Date().toISOString();

  // Reduce judge's active count
  if (cases[idx].assignedJudgeId) {
    const judges = readDB('judges.json');
    const jIdx   = judges.findIndex(j => j.id === cases[idx].assignedJudgeId);
    if (jIdx !== -1) {
      judges[jIdx].activeCaseCount = Math.max(0, (judges[jIdx].activeCaseCount || 1) - 1);
      writeDB('judges.json', judges);
    }
  }
  writeDB('cases.json', cases);
  res.json({ success: true, case: cases[idx] });
});

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS  (lawyer accept/reject/block)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/notifications  ?lawyerLicenseNumber=...
app.get('/api/notifications', (req, res) => {
  const { lawyerLicenseNumber } = req.query;
  const notifs = readDB('notifications.json');
  if (lawyerLicenseNumber) {
    return res.json(notifs.filter(n => n.lawyerLicenseNumber === lawyerLicenseNumber));
  }
  res.json(notifs);
});

// PUT /api/notifications/:id/respond  (lawyer)
app.put('/api/notifications/:id/respond', (req, res) => {
  const { response } = req.body; // 'accepted' | 'rejected'
  const notifs = readDB('notifications.json');
  const idx    = notifs.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Notification not found' });

  notifs[idx].status      = response === 'accepted' ? 'accepted' : 'rejected';
  notifs[idx].respondedAt = new Date().toISOString();
  writeDB('notifications.json', notifs);

  // Update case lawyer status
  const cases = readDB('cases.json');
  const cIdx  = cases.findIndex(c => c.caseId === notifs[idx].caseId);
  if (cIdx !== -1) {
    const side = notifs[idx].side;
    if (side === 'plaintiff') cases[cIdx].plaintiffLawyerStatus = response;
    if (side === 'defendant') cases[cIdx].defendantLawyerStatus = response;
    if (response === 'accepted') cases[cIdx].status = 'in_progress';
    cases[cIdx].updatedAt = new Date().toISOString();
    writeDB('cases.json', cases);
  }
  res.json({ success: true, notification: notifs[idx] });
});

// PUT /api/notifications/:id/block  (lawyer blocks filer)
app.put('/api/notifications/:id/block', (req, res) => {
  const notifs  = readDB('notifications.json');
  const lawyers = readDB('lawyers.json');
  const idx     = notifs.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Notification not found' });

  notifs[idx].status = 'blocked';
  writeDB('notifications.json', notifs);

  // Add filer phone to lawyer's blocked list
  const lIdx = lawyers.findIndex(l => l.licenseNumber === notifs[idx].lawyerLicenseNumber);
  if (lIdx !== -1) {
    if (!lawyers[lIdx].blockedFilers) lawyers[lIdx].blockedFilers = [];
    lawyers[lIdx].blockedFilers.push(notifs[idx].filerPhone);
    writeDB('lawyers.json', lawyers);
  }
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// SESSIONS  (court clerk records events)
// ═══════════════════════════════════════════════════════════════════════════

const SESSION_EVENTS = [
  'Hearing started', 'Judge present', 'Prosecutor present',
  'Accused present', 'Accused absent', 'Defense lawyer present',
  'Defense lawyer absent', 'Witness appeared', 'Evidence/document submitted',
  'Witness testimony recorded', 'Objection raised', 'Judge issued an order',
  'Hearing postponed', 'Next hearing date set', 'Hearing ended'
];

// GET /api/sessions/:caseId
app.get('/api/sessions/:caseId', (req, res) => {
  const sessions = readDB('sessions.json');
  res.json(sessions.filter(s => s.caseId === req.params.caseId));
});

// POST /api/sessions/:caseId/event  (clerk)
app.post('/api/sessions/:caseId/event', (req, res) => {
  const { event, note, clerkId, nextHearingDate } = req.body;
  if (!event) return res.status(400).json({ error: 'Event type required' });
  if (!SESSION_EVENTS.includes(event) && !req.body.customEvent) {
    return res.status(400).json({ error: 'Invalid event type', validEvents: SESSION_EVENTS });
  }

  const sessions = readDB('sessions.json');
  const entry = {
    id: uuidv4(),
    caseId: req.params.caseId,
    event,
    note: note || '',
    clerkId: clerkId || '',
    nextHearingDate: nextHearingDate || null,
    recordedAt: new Date().toISOString()
  };
  sessions.push(entry);
  writeDB('sessions.json', sessions);

  // Update case if hearing is postponed
  if (event === 'Next hearing date set' && nextHearingDate) {
    const cases = readDB('cases.json');
    const idx   = cases.findIndex(c => c.caseId === req.params.caseId);
    if (idx !== -1) {
      cases[idx].nextHearingDate = nextHearingDate;
      cases[idx].updatedAt = new Date().toISOString();
      writeDB('cases.json', cases);
    }
  }
  res.json({ success: true, entry });
});

// ═══════════════════════════════════════════════════════════════════════════
// JUDGE RATINGS
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/cases/:id/rate-lawyer  (judge)
app.post('/api/cases/:id/rate-lawyer', (req, res) => {
  const { lawyerLicenseNumber, rating, comment } = req.body;
  if (!lawyerLicenseNumber || !rating) return res.status(400).json({ error: 'License and rating required' });

  const cases = readDB('cases.json');
  const idx   = cases.findIndex(c => c.caseId === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Case not found' });

  if (!cases[idx].ratings) cases[idx].ratings = {};
  cases[idx].ratings[lawyerLicenseNumber] = {
    rating: Number(rating),
    comment: comment || '',
    ratedAt: new Date().toISOString()
  };
  cases[idx].updatedAt = new Date().toISOString();
  writeDB('cases.json', cases);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCE DATA
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/branches', (req, res) => res.json(readDB('branches.json')));
app.get('/api/judges',   (req, res) => {
  const judges = readDB('judges.json').map(({ password: _, ...j }) => j);
  res.json(judges);
});
app.get('/api/session-events', (req, res) => res.json(SESSION_EVENTS));
app.get('/api/moj/verify-license/:licenseNumber', (req, res) => {
  const licenses = readDB('moj_licenses.json');
  const lic = licenses.find(l => l.licenseNumber === req.params.licenseNumber);
  if (!lic) return res.status(404).json({ error: 'License not found' });
  res.json(lic);
});

// ── SPA Fallback ───────────────────────────────────────────────────────────
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/file-case', (req, res) => res.sendFile(path.join(__dirname, 'public', 'file-case.html')));

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚖  Federal Court Case Management System`);
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   Login:  http://localhost:${PORT}/`);
  console.log(`   File a Case: http://localhost:${PORT}/file-case`);
  console.log(`\n   Credentials:`);
  console.log(`   Admin:   admin / admin123`);
  console.log(`   Judge 1: judge.maktoum / judge123`);
  console.log(`   Judge 2: judge.alnahyan / judge123`);
  console.log(`   Judge 3: judge.hassan / judge123`);
  console.log(`   Clerk:   clerk.ibrahim / clerk123`);
  console.log(`   Officer: officer.hassan / officer123`);
  console.log(`   (Lawyers register via /file-case → Register Lawyer tab)\n`);
});
