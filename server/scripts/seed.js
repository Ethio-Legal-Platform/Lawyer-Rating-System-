import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ── JSON data paths ────────────────────────────────────────────────────────────
import { readJSON } from "../lib/db.js";
import {
  USERS_PATH,
  MOJ_LICENSES_PATH,
  COURT_CASES_PATH,
  QUESTIONS_PATH,
} from "../config/paths.js";

// ── Mongoose models ────────────────────────────────────────────────────────────
import User from "../models/User.js";
import MojLicense from "../models/MojLicense.js";
import CourtCase from "../models/CourtCase.js";
import Question from "../models/Questions.js";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Upserts an array of documents into a Mongoose model.
 * @param {mongoose.Model} Model
 * @param {object[]} docs
 * @param {string} uniqueKey - Field used as the unique identifier for upsert.
 */
async function upsertAll(Model, docs, uniqueKey) {
  if (!docs.length) {
    console.log(`  ⚠  No data found for ${Model.modelName} — skipping.`);
    return;
  }

  let inserted = 0;
  let updated = 0;

  for (const doc of docs) {
    const filter = { [uniqueKey]: doc[uniqueKey] };
    const result = await Model.updateOne(filter, { $set: doc }, { upsert: true });
    if (result.upsertedCount) inserted++;
    else if (result.modifiedCount) updated++;
  }

  console.log(
    `  ✔  ${Model.modelName}: ${inserted} inserted, ${updated} updated (${docs.length} total).`,
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "\n  ✖  MONGODB_URI is not set in .env. Aborting seed.\n",
    );
    process.exit(1);
  }

  console.log("\n🌱  LEX-RATING — MongoDB Seed Script");
  console.log("────────────────────────────────────");
  console.log(`  Connecting to: ${uri}\n`);

  await mongoose.connect(uri);
  console.log("  MongoDB connected.\n");

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = readJSON(USERS_PATH, []);
  await upsertAll(User, users, "id");

  // ── MoJ Licenses ──────────────────────────────────────────────────────────
  // Derive license records from the lawyers in users.json when the
  // dedicated moj_licenses.json file is empty (common during development).
  let licenses = readJSON(MOJ_LICENSES_PATH, []);

  if (!licenses.length) {
    console.log(
      "  ℹ  moj_licenses.json is empty — generating license records from users.json lawyers.\n",
    );
    licenses = users
      .filter((u) => u.role === "lawyer" && u.licenseNumber)
      .map((u) => ({
        licenseNumber: u.licenseNumber,
        fullName: u.name,
        status: "ACTIVE",
        issueDate: "2015-01-01",
        expiryDate: "2030-12-31",
        specialization: u.specialization || null,
        regionalBar: u.city || null,
      }));
  }
  await upsertAll(MojLicense, licenses, "licenseNumber");

  // ── Court Cases ────────────────────────────────────────────────────────────
  const cases = readJSON(COURT_CASES_PATH, []);
  await upsertAll(CourtCase, cases, "caseId");

  // ── Questions ──────────────────────────────────────────────────────────────
  const questions = readJSON(QUESTIONS_PATH, []);
  await upsertAll(Question, questions, "id");

  console.log("\n  ✅  Seed complete.\n");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n  ✖  Seed failed:", err.message);
  process.exit(1);
});
