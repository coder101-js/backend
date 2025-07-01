import dotenv from "dotenv";
import process from "process";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { blockHeadlessBrowser } from "./middleWare/headlessBrowser.mjs";
import rateLimit from "express-rate-limit";

const app = express();

import middleMan from "./middleMan.mjs";
app.use(
  cors({
    origin: [
      "http://localhost:3000", // dev
      "https://api.buttnetworks.com", // API subdomain
      "https://buttnetworks.com", // main frontend site
    ],
    credentials: true,
  })
);

const burstLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // Max 10 reqs per second
  message: "Too many requests - chill out 🧊",
  handler: (req, res) => {
    // Optional: Log and trigger alerts
    res.status(429).send("Rate limit exceeded. Try again later. 🚫");
  },
});
app.use(burstLimiter);
app.use(blockHeadlessBrowser);
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 3000;
app.use("/gateway", middleMan); // ✅Using router correctly now

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB connected"); //turn on server after mongoDB get connected!
    app.listen(port, () => {
      console.log(`App is listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error(" Mongo connection error:", err.message);
    process.exit(1);
  }
})();
