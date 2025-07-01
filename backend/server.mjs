import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../Database/db.mjs";
import rateLimit from "express-rate-limit";
import { blockHeadlessBrowser } from "./middleWare/headlessBrowser.mjs";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: ["https://api.buttnetworks.com", "https://buttnetworks.com"],
    credentials: true,
  })
);
app.use(rateLimit({ windowMs: 1000, max: 10 }));
app.use(blockHeadlessBrowser);
app.use(express.json());
app.use(cookieParser());

(async () => {
  try {
    await connectDB(); // 🔌 Connect once

    const { default: User } = await import("../Database/userData.mjs");

    app.get("/test", async (req, res) => {
      const user = await User.findOne();
      res.json(user || { msg: "No users found" });
    });

    const { default: middleMan } = await import("./middleMan.mjs");
    app.use("/gateway", middleMan); // ✅ Now it works

    app.listen(port, () => {
      console.log(`🚀 Server live at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Connection Error:", err.message);
  }
})();
