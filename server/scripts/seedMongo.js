import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB } from '../lib/mongoose.js';
import { readJSON }  from '../lib/db.js';
import { USERS_PATH, MOJ_LICENSES_PATH, COURT_CASES_PATH, QUESTIONS_PATH } from '../config/paths.js';

import User       from '../models/User.js';
import MojLicense from '../models/MojLicense.js';
import CourtCase  from '../models/CourtCase.js';
import Question   from '../models/Question.js';

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in your .env file.');
    console.error('   Please add it and try again.');
    process.exit(1);
  }

  await connectDB();

  console.log('Seeding MongoDB Atlas from local JSON files...\n');

  const users      = readJSON(USERS_PATH);
  const licenses   = readJSON(MOJ_LICENSES_PATH);
  const cases      = readJSON(COURT_CASES_PATH);
  const questions  = readJSON(QUESTIONS_PATH);

  // Users
  let uCount = 0;
  for (const user of users) {
    await User.updateOne({ id: user.id }, user, { upsert: true });
    uCount++;
  }
  console.log(`  ✓ Users:       ${uCount} upserted`);

  // MoJ Licenses
  let lCount = 0;
  for (const lic of licenses) {
    await MojLicense.updateOne({ licenseNumber: lic.licenseNumber }, lic, { upsert: true });
    lCount++;
  }
  console.log(`  ✓ MoJ Licenses: ${lCount} upserted`);

  // Court Cases
  let cCount = 0;
  for (const c of cases) {
    await CourtCase.updateOne({ caseId: c.caseId }, c, { upsert: true });
    cCount++;
  }
  console.log(`  ✓ Court Cases:  ${cCount} upserted`);

  // Questions
  let qCount = 0;
  for (const q of questions) {
    await Question.updateOne({ id: q.id }, q, { upsert: true });
    qCount++;
  }
  console.log(`  ✓ Questions:    ${qCount} upserted`);

  console.log('\n✅ Seed complete. MongoDB Atlas is ready.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
