import dotenv from "dotenv";
import process from "process";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { blockHeadlessBrowser } from "./middleWare/headlessBrowser.mjs";

const app = express();

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5001", // dev
      "http://localhost:5000", // dev
      "https://api.buttnetworks.com", // API subdomain
      "https://buttnetworks.com", // main frontend site
    ],
    credentials: true,
  })
);

const burstLimiter = rateLimit({
  windowMs: 1000,
  max: 10,
  message: "Too many requests - chill out 🧊",
  handler: (req, res) => {
    res.status(429).send("Rate limit exceeded. Try again later. 🚫");
  },
});

app.use(burstLimiter);
app.use(blockHeadlessBrowser);
app.use(express.json());
app.use(cookieParser());

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // ⬇️ Delay this until AFTER mongoose is ready!
    const { default: middleMan } = await import("./middleMan.mjs");
    app.use("/gateway", middleMan);

    app.listen(port, () => {
      console.log(`🚀 App listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  }
})();
