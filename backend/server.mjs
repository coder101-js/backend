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
// ⬇️ Import your router
const { default: middleMan } = await import("./middleMan.mjs");
app.use("/gateway", middleMan); // ⬅️ This handles all /gateway requests


(async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    
    // 2. Import model AFTER connecting
    const { default: User } = await import("../Database/userData.mjs");

    // 3. Test route
    app.get("/test", async (req, res) => {
      try {
        const user = await User.findOne(); // Get 1st user
        res.json(user || { msg: "No user found" });
      } catch (err) {
        res.status(500).json({ err: err.message });
      }
    });
    
    // 4. Start Server
    app.listen(port, () => {
      console.log(`🚀 App listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  }
})();
