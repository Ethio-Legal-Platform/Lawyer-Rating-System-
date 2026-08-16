import fs from 'fs';
import path from 'path';

/**
 * Reads a JSON file. Creates it with `defaultValue` if it doesn't exist.
 * @param {string} filePath - Absolute path to the JSON file.
 * @param {*} defaultValue  - Value to seed the file with if missing.
 * @returns {*} Parsed JSON content.
 */
export function readJSON(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`[db] Failed to read ${filePath}:`, err);
    return defaultValue;
  }
}

/**
 * Writes data to a JSON file (pretty-printed).
 * @param {string} filePath - Absolute path to the JSON file.
 * @param {*} data          - Data to serialize and write.
 */
export function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[db] Failed to write ${filePath}:`, err);
  }
}
