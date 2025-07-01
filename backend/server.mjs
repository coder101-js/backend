import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

(async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // 2. Import model AFTER connecting
    const { default: User } = await import("./Database/userData.mjs");

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
