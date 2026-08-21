import bcrypt from 'bcrypt';
import { readJSON, writeJSON } from '../lib/db.js';
import { USERS_PATH } from '../config/paths.js';

const SALT_ROUNDS = 10;

async function hashAllPasswords() {
  const users = readJSON(USERS_PATH);
  let count = 0;

  for (const user of users) {
    if (user.password && !user.password.startsWith('$2')) {
      user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
      count++;
      console.log(` Hashed password for: ${user.username}`);
    }
  }

  writeJSON(USERS_PATH, users);
  console.log(`\nDone. ${count} password(s) hashed.\n`);
}

hashAllPasswords().catch(console.error);
