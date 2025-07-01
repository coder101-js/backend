// server.mjs
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./Database/db.js"; // 👈 new db file
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
    await connectDB(); // ⬅️ connect once

    // models will now use shared instance
    const { default: User } = await import("./Database/userData.mjs");

    // test route
    app.get("/test", async (req, res) => {
      const user = await User.findOne();
      res.json(user || { msg: "No users found" });
    });

    const { default: middleMan } = await import("./middleMan.mjs");
    app.use("/gateway", middleMan);

    app.listen(port, () => {
      console.log(`🚀 Server live at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Connection Error:", err.message);
  }
})();
