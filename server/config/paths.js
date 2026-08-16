import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Root of the server/ directory
export const SERVER_DIR = path.resolve(__dirname, '..');

// Data directory
export const DATA_DIR = path.join(SERVER_DIR, 'data');

// Individual data file paths
export const USERS_PATH        = path.join(DATA_DIR, 'users.json');
export const MOJ_LICENSES_PATH = path.join(DATA_DIR, 'moj_licenses.json');
export const COURT_CASES_PATH  = path.join(DATA_DIR, 'court_cases.json');
