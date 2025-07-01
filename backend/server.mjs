// server.mjs
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { blockHeadlessBrowser } from "./middleWare/headlessBrowser.mjs";

const app = express();
const port = process.env.PORT || 3000;

// CORS & security middleware
app.use(
  cors({
    origin: ["https://api.buttnetworks.com", "https://buttnetworks.com"],
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 1000,
    max: 10,
    message: "Too many requests - chill out 🧊",
  })
);
app.use(blockHeadlessBrowser);
app.use(express.json());
app.use(cookieParser());

// ✅ Wrap everything in an async init function
const init = async () => {
  try {
    // 1. Connect to Mongo
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "userData",
    });
    console.log("✅ MongoDB connected");
    const { default: User } = await import("./Database/userData.mjs");
    const test = await User.findOne();
    console.log("🧪 Test Query Result:", test);

    // 2. Import your models AFTER connection
    // 3. Import your routes AFTER models are ready
    const { default: middleMan } = await import("./middleMan.mjs");
    app.use("/gateway", middleMan);

    // 4. Start server
    app.listen(port, () => {
      console.log(`🚀 App listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  }
};

init(); // 🚀
