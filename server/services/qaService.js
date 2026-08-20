import { mongoose } from "../lib/mongoose.js";

async function getModel() {
  if (mongoose.connection.readyState === 1) {
    return (await import("../models/Questions.js")).default;
  }
  return null;
}

async function readQuestions() {
  const Model = await getModel();
  if (Model) return Model.find().lean();
  const { readJSON } = await import("../lib/db.js");
  const { QUESTIONS_PATH } = await import("../config/paths.js");
  return readJSON(QUESTIONS_PATH, []);
}

async function saveQuestion(doc) {
  const Model = await getModel();
  if (Model) {
    await Model.updateOne({ id: doc.id }, doc, { upsert: true });
    return;
  }
  const { readJSON, writeJSON } = await import("../lib/db.js");
  const { QUESTIONS_PATH } = await import("../config/paths.js");
  const questions = readJSON(QUESTIONS_PATH, []);
  const idx = questions.findIndex((q) => q.id === doc.id);
  if (idx === -1) questions.unshift(doc);
  else questions[idx] = doc;
  writeJSON(QUESTIONS_PATH, questions);
}

export async function getQuestions({
  category,
  search,
  city,
  includePrivate,
} = {}) {
  let questions = await readQuestions();
  if (!includePrivate) questions = questions.filter((q) => !q.isPrivate);
  if (category && category !== "All")
    questions = questions.filter(
      (q) => q.category?.toLowerCase() === category.toLowerCase(),
    );
  if (city && city !== "All")
    questions = questions.filter(
      (q) => q.city?.toLowerCase() === city.toLowerCase(),
    );
  if (search) {
    const t = search.toLowerCase();
    questions = questions.filter(
      (q) =>
        q.title?.toLowerCase().includes(t) ||
        q.description?.toLowerCase().includes(t) ||
        q.category?.toLowerCase().includes(t),
    );
  }
  return questions.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export async function getPrivateInquiries({
  userId,
  role,
  city,
  specialization,
} = {}) {
  const questions = await readQuestions();
  const privateList = questions.filter((q) => q.isPrivate);

  if (role === "lawyer") {
    return privateList
      .filter((q) => {
        if (q.targetLawyerId === userId) return true;
        if (!q.targetLawyerId) {
          const matchCity =
            !city || !q.city || q.city.toLowerCase() === city.toLowerCase();
          const matchSpec =
            !specialization ||
            !q.category ||
            q.category.toLowerCase().includes(specialization.toLowerCase());
          return matchCity || matchSpec;
        }
        return false;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return privateList
    .filter((q) => q.authorId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getQuestionById(id) {
  const Model = await getModel();
  if (Model) return Model.findOne({ id }).lean();
  const questions = await readQuestions();
  return questions.find((q) => q.id === id) || null;
}

export async function createQuestion({
  title,
  description,
  category,
  city,
  authorName,
  authorRole,
  authorId,
  isPrivate,
  targetLawyerId,
  targetLawyerName,
}) {
  if (!authorId) throw new Error("You must be signed in to ask a question");
  if (!title || !description)
    throw new Error("Title and description are required");

  const newQuestion = {
    id: `q-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    category: category || "General",
    city: city || "Addis Ababa",
    authorName: authorName || "Anonymous Litigant",
    authorRole: authorRole || "client",
    authorId,
    isPrivate: Boolean(isPrivate),
    targetLawyerId: targetLawyerId || null,
    targetLawyerName: targetLawyerName || null,
    status: isPrivate ? "private_pending" : "public",
    createdAt: new Date().toISOString(),
    publishedAt: isPrivate ? null : new Date().toISOString(),
    answers: [],
  };

  await saveQuestion(newQuestion);
  return newQuestion;
}

export async function publishQuestionToPublic(questionId, userId) {
  const Model = await getModel();

  if (Model) {
    const q = await Model.findOne({ id: questionId }).lean();
    if (!q) throw new Error("Question not found");
    if (q.authorId !== userId)
      throw new Error("Only the author can publish this question");
    return Model.findOneAndUpdate(
      { id: questionId },
      {
        isPrivate: false,
        status: "public",
        publishedAt: new Date().toISOString(),
      },
      { new: true },
    ).lean();
  }

  const { readJSON, writeJSON } = await import("../lib/db.js");
  const { QUESTIONS_PATH } = await import("../config/paths.js");
  const questions = readJSON(QUESTIONS_PATH, []);
  const q = questions.find((q) => q.id === questionId);
  if (!q) throw new Error("Question not found");
  if (q.authorId !== userId)
    throw new Error("Only the author can publish this question");
  q.isPrivate = false;
  q.status = "public";
  q.publishedAt = new Date().toISOString();
  writeJSON(QUESTIONS_PATH, questions);
  return q;
}

export async function addAnswer(
  questionId,
  {
    content,
    authorId,
    authorName,
    authorUsername,
    authorRole,
    isLawyer,
    licenseNumber,
    specialization,
    elo,
    profilePic,
    city,
  },
) {
  if (!authorId) throw new Error("You must be signed in to post a reply");
  if (!content?.trim()) throw new Error("Answer content cannot be empty");

  const newAnswer = {
    id: `ans-${Date.now()}`,
    content: content.trim(),
    authorId,
    authorName: authorName || (isLawyer ? "Advocate" : "Community Member"),
    authorUsername: authorUsername || "user",
    authorRole: isLawyer ? "lawyer" : authorRole || "client",
    isLawyer: Boolean(isLawyer),
    licenseNumber: licenseNumber || null,
    specialization: specialization || null,
    elo: elo || null,
    profilePic:
      profilePic ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    city: city || "Ethiopia",
    upvotes: 0,
    upvotedBy: [],
    createdAt: new Date().toISOString(),
  };

  const Model = await getModel();
  if (Model) {
    const update = isLawyer
      ? { $push: { answers: { $each: [newAnswer], $position: 0 } } }
      : { $push: { answers: newAnswer } };
    if (isLawyer) update.$set = { status: "advocate_answered" };
    await Model.updateOne({ id: questionId }, update);
    return newAnswer;
  }

  const { readJSON, writeJSON } = await import("../lib/db.js");
  const { QUESTIONS_PATH } = await import("../config/paths.js");
  const questions = readJSON(QUESTIONS_PATH, []);
  const idx = questions.findIndex((q) => q.id === questionId);
  if (idx === -1) throw new Error("Question not found");
  if (!Array.isArray(questions[idx].answers)) questions[idx].answers = [];
  if (isLawyer) {
    questions[idx].answers.unshift(newAnswer);
    if (questions[idx].isPrivate) questions[idx].status = "advocate_answered";
  } else {
    questions[idx].answers.push(newAnswer);
  }
  writeJSON(QUESTIONS_PATH, questions);
  return newAnswer;
}

export async function upvoteAnswer(questionId, answerId, userId) {
  if (!userId) throw new Error("You must be signed in to upvote");

  const Model = await getModel();
  if (Model) {
    const q = await Model.findOne({
      id: questionId,
      "answers.id": answerId,
    }).lean();
    if (!q) throw new Error("Question or answer not found");
    const ans = q.answers.find((a) => a.id === answerId);
    const hasUpvoted = ans.upvotedBy?.includes(userId);

    if (hasUpvoted) {
      await Model.updateOne(
        { id: questionId, "answers.id": answerId },
        {
          $pull: { "answers.$.upvotedBy": userId },
          $inc: { "answers.$.upvotes": -1 },
        },
      );
    } else {
      await Model.updateOne(
        { id: questionId, "answers.id": answerId },
        {
          $push: { "answers.$.upvotedBy": userId },
          $inc: { "answers.$.upvotes": 1 },
        },
      );
    }
    return {
      hasUpvoted: !hasUpvoted,
      upvotes: hasUpvoted ? ans.upvotes - 1 : ans.upvotes + 1,
    };
  }

  const { readJSON, writeJSON } = await import("../lib/db.js");
  const { QUESTIONS_PATH } = await import("../config/paths.js");
  const questions = readJSON(QUESTIONS_PATH, []);
  const q = questions.find((q) => q.id === questionId);
  if (!q) throw new Error("Question not found");
  const ans = q.answers?.find((a) => a.id === answerId);
  if (!ans) throw new Error("Answer not found");
  if (!Array.isArray(ans.upvotedBy)) ans.upvotedBy = [];
  const pos = ans.upvotedBy.indexOf(userId);
  if (pos > -1) {
    ans.upvotedBy.splice(pos, 1);
    ans.upvotes = Math.max(0, (ans.upvotes || 1) - 1);
  } else {
    ans.upvotedBy.push(userId);
    ans.upvotes = (ans.upvotes || 0) + 1;
  }
  writeJSON(QUESTIONS_PATH, questions);
  return { hasUpvoted: pos === -1, upvotes: ans.upvotes };
}
