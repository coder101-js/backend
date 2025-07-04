import User from "../../Database/userData.mjs";
import { compare } from "bcryptjs";
import {
  generateToken,
  generateRefreshToken,
  generateAccountVerificationToken,
} from "./jwt.mjs";
import { generateOTP, saveVerificationEmailOtp, emailType } from "./mail.mjs";
import { validateCaptcha } from "./Captcha.mjs";
import rateLimit from "express-rate-limit";

// Inline limiter (per email or fallback to IP)
const loginLimiter = rateLimit({
  keyGenerator: (req) => req.body.email || req.ip,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: "Too many login attempts. Please try again after 15 minutes ⏳",
    });
  },
});

export const login = async (req, res) => {
  //  Manually call the limiter
  loginLimiter(req, res, async (err) => {
    if (err) return; // limiter already handled response

    try {
      const { email, password, captchaToken } = req.body || {};

      // ✅ Captcha validation
      const captchaValid = await validateCaptcha(captchaToken);
      if (!captchaValid) {
        console.log('" password"')
        return res.status(403).send({ err: "Captcha token is incorrect!" });
      }

      // ❗ Check required fields
      if (!email || !password) {
        return res.status(400).send({ err: "Incorrect data format" });
      }

      // 🔍 Check user existence
      const user = await User.findOne({ email }).lean();
      if (!user) {
        return res
          .status(404)
          .json({ error: "User does not exist", verify: null });
      }
      if (!user.active) {
        const accountVerificationToken =
          generateAccountVerificationToken(email);
        res.cookie("account_verification", accountVerificationToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 1000,
        });
        const otp = generateOTP();

        await emailType("verify", email, otp);
        await saveVerificationEmailOtp(email, otp);
        return res.status(200).json({
          error: "Your account is not Verified",
          verify: false,
          redirectTo: `https://buttnetworks.com/Account-verification?email=${user.email}`,
        });
      }
      // 🔐 Check password
      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        console.log('"Incorrect password"')
        return res
          .status(403)
          .send({ err: "Incorrect password", verify: true });
      }

      // 🎟️ Generate tokens
      const accessToken = generateToken(email);
      const refreshToken = generateRefreshToken(email);

      // 🍪 Set tokens in cookies
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 60 * 60 * 1000,
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res
        .status(200)
        .json({ message: "User logged in successfully ✅", verify: true ,redirectTo:'https://buttnetworks.com/home'});
    } catch (err) {
      console.error("💥 Login error:", err);
      return res.status(500).send({ err: "Server error — try again later" });
    }
  });
};
