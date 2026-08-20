import { mongoose } from "../lib/mongoose.js";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["lawyer", "client", "judge", "admin"],
      required: true,
    },
    verified: { type: Boolean, default: false },
    profilePic: { type: String, default: null },
    licenseNumber: { type: String, default: null },
    specialization: { type: String, default: null },
    elo: { type: Number, default: null },
    city: { type: String, default: null },
    phone: { type: String, default: null },
    bio: { type: String, default: null },
    yearsExperience: { type: Number, default: null },
    languages: { type: [String], default: [] },
    education: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
