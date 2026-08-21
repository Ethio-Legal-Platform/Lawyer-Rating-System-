import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB, mongoose } from '../lib/mongoose.js';
import { readJSON, writeJSON } from '../lib/db.js';
import {
  USERS_PATH,
  MOJ_LICENSES_PATH,
  COURT_CASES_PATH,
  QUESTIONS_PATH,
} from '../config/paths.js';
import User from '../models/User.js';
import MojLicense from '../models/MojLicense.js';
import CourtCase from '../models/CourtCase.js';
import Question from '../models/Question.js';

function withoutMongoMetadata(document) {
  const { _id, __v, ...record } = document;
  return record;
}

function mergeRecords(localRecords, mongoRecords, key) {
  const merged = new Map(localRecords.map(record => [record[key], record]));

  for (const record of mongoRecords) {
    const cleanRecord = withoutMongoMetadata(record);
    const existing = merged.get(cleanRecord[key]);
    merged.set(cleanRecord[key], existing ? { ...existing, ...cleanRecord } : cleanRecord);
  }

  return [...merged.values()];
}

async function syncCollection({ name, model, filePath, key }) {
  const [localRecords, mongoRecords] = await Promise.all([
    readJSON(filePath, []),
    model.find().lean(),
  ]);
  const mergedRecords = mergeRecords(localRecords, mongoRecords, key);
  writeJSON(filePath, mergedRecords);

  console.log(`  ${name}: ${localRecords.length} local + ${mongoRecords.length} Mongo -> ${mergedRecords.length} merged`);
}

async function sync() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  await connectDB();
  console.log('Syncing MongoDB to local JSON files (MongoDB is read-only)...\n');

  await syncCollection({ name: 'Users', model: User, filePath: USERS_PATH, key: 'id' });
  await syncCollection({ name: 'MoJ Licenses', model: MojLicense, filePath: MOJ_LICENSES_PATH, key: 'licenseNumber' });
  await syncCollection({ name: 'Court Cases', model: CourtCase, filePath: COURT_CASES_PATH, key: 'caseId' });
  await syncCollection({ name: 'Questions', model: Question, filePath: QUESTIONS_PATH, key: 'id' });

  await mongoose.disconnect();
  console.log('\nSync complete. MongoDB was not modified.');
}

sync().catch(async error => {
  console.error(`Sync failed: ${error.message}`);
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  process.exitCode = 1;
});