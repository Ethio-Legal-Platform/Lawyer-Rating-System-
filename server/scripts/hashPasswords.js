/**
 * hashPasswords.js — One-time script to bcrypt-hash all plain-text passwords
 * in users.json. Safe to re-run — already-hashed passwords are skipped.
 *
 * Usage:
 *   node server/scripts/hashPasswords.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { readJSON, writeJSON } from '../lib/db.js';
import { USERS_PATH } from '../config/paths.js';

const SALT_ROUNDS = 10;

async function hashPasswords() {
  console.log('\n🔐  LEX-RATING — Password Hash Script');
  console.log('─────────────────────────────────────');

  const users = readJSON(USERS_PATH, []);
  let hashed = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.password) { skipped++; continue; }
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      skipped++;
      continue;
    }
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
    hashed++;
    process.stdout.write(`  ✔  Hashed: ${user.username}\n`);
  }

  writeJSON(USERS_PATH, users);

  console.log(`\n  ✅  Done. ${hashed} passwords hashed, ${skipped} already secure.\n`);
  process.exit(0);
}

hashPasswords().catch(err => {
  console.error('\n  ✖  Failed:', err.message);
  process.exit(1);
});
