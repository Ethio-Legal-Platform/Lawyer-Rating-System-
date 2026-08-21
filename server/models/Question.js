import { mongoose } from '../lib/mongoose.js';

const answerSchema = new mongoose.Schema({
  id:             { type: String, required: true },
  content:        { type: String, required: true },
  authorId:       { type: String },
  authorName:     { type: String },
  authorUsername: { type: String },
  authorRole:     { type: String },
  isLawyer:       { type: Boolean, default: false },
  licenseNumber:  { type: String, default: null },
  specialization: { type: String, default: null },
  elo:            { type: Number, default: null },
  profilePic:     { type: String, default: null },
  city:           { type: String, default: null },
  upvotes:        { type: Number, default: 0 },
  upvotedBy:      { type: [String], default: [] },
  createdAt:      { type: String },
});

const questionSchema = new mongoose.Schema({
  id:               { type: String, required: true, unique: true },
  title:            { type: String, required: true },
  description:      { type: String, required: true },
  category:         { type: String, default: 'General' },
  city:             { type: String, default: null },
  authorId:         { type: String },
  authorName:       { type: String },
  authorRole:       { type: String },
  isPrivate:        { type: Boolean, default: false },
  targetLawyerId:   { type: String, default: null },
  targetLawyerName: { type: String, default: null },
  status:           { type: String, default: 'public' },
  publishedAt:      { type: String, default: null },
  answers:          { type: [answerSchema], default: [] },
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', questionSchema);
