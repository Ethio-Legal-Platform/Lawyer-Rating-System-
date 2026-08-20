import { mongoose } from "../lib/mongoose.js";

const mojLicenseSchema = new mongoose.Schema(
  {
    licenseNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    issueDate: { type: String },
    expiryDate: { type: String },
    specialization: { type: String },
    regionalBar: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.MojLicense ||
  mongoose.model("MojLicense", mojLicenseSchema);
