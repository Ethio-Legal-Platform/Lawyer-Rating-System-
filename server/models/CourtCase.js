import { mongoose } from "../lib/mongoose.js";

const courtCaseSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, unique: true },
    caseTitle: { type: String, required: true },
    caseType: { type: String, default: "Civil" },
    dateDecided: { type: String },
    status: { type: String, default: "Decided" },

    judgeId: { type: String },
    judgeName: { type: String },

    plaintiffClientId: { type: String },
    plaintiffClientName: { type: String },
    plaintiffLawyerLicense: { type: String },
    plaintiffLawyerName: { type: String },
    judgeRatingPlaintiff: { type: Number, default: 5.0 },
    clientRatingPlaintiff: { type: Number, default: 5.0 },

    defendantClientId: { type: String },
    defendantClientName: { type: String },
    defendantLawyerLicense: { type: String },
    defendantLawyerName: { type: String },
    judgeRatingDefendant: { type: Number, default: 4.0 },
    clientRatingDefendant: { type: Number, default: 4.0 },

    verdict: { type: String, default: "Decided" },
  },
  { timestamps: true },
);

export default mongoose.models.CourtCase ||
  mongoose.model("CourtCase", courtCaseSchema);
