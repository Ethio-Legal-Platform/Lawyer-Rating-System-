import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn(
      "\n  MONGODB_URI not set in .env — falling back to JSON file storage.\n",
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log("  MongoDB connected successfully.\n");
  } catch (err) {
    console.warn("  MongoDB connection failed:", err.message);
    console.warn("  Falling back to JSON file storage.\n");
  }
}

export { mongoose };
