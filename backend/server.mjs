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

// CORS & middlewares
app.use(
  cors({
    origin: [
      "https://api.buttnetworks.com",
      "https://buttnetworks.com",
    ],
    credentials: true,
  })
);
app.use(rateLimit({
  windowMs: 1000,
  max: 10,
  message: "Too many requests - chill out 🧊",
}));
app.use(blockHeadlessBrowser);
app.use(express.json());
app.use(cookieParser());

;(async () => {
  try {
    // 1. Connect to MongoDB (with explicit DB name)
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "userData",
    });
    console.log("✅ MongoDB connected");

    // 2. Now that mongoose is ready, import your routes (and models)
    const { default: middleMan } = await import("./middleMan.mjs");
    app.use("/gateway", middleMan);

    // 3. Start the server
    app.listen(port, () => {
      console.log(`🚀 App listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  }
})();
