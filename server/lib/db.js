import fs from "fs";

/**
 * Reads and parses a JSON file. Returns `fallback` if the file is missing or malformed.
 * @param {string} filePath - Absolute path to the JSON file.
 * @param {*} fallback - Value to return on failure (default: []).
 */
export function readJSON(filePath, fallback = []) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw || raw.trim() === "") return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Serialises `data` and writes it to a JSON file (pretty-printed).
 * @param {string} filePath - Absolute path to the JSON file.
 * @param {*} data - Serialisable value to persist.
 */
export function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
