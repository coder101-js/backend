import User from "../../Database/userData.mjs";
import { hash } from "bcryptjs";
import {
  generateToken,
  generateRefreshToken,
  generateAccountVerificationToken,
} from "./jwt.mjs";
import { validateCaptcha } from "./Captcha.mjs";
import rateLimit from "express-rate-limit";
import { generateOTP, saveVerificationEmailOtp, emailType } from "./mail.mjs";

// 💥 Optional: rate limit signup to avoid abuse
const signupLimiter = rateLimit({
  keyGenerator: (req) => req.body.email || req.ip,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // max 5 signups per hour per email/IP
  legacyHeaders: false,
  standardHeaders: "draft-8",
  handler: (req, res) => {
    return res.status(429).json({
      err: "Too many signup attempts — please wait ⏳",
    });
  },
});

export const signup = async (req, res) => {
  signupLimiter(req, res, async (err) => {
    if (err) return; // limiter already handled the response

    try {
      const { email, password, username, captchaToken } = req.body || {};

      // ✅ Captcha check
      const captchaValid = await validateCaptcha(captchaToken);
      if (!captchaValid) {
        return res.status(403).json({ err: "Captcha token is incorrect! " });
      }

      //  Basic validation
      if (!email || !password || !username) {
        return res
          .status(400)
          .json({ err: "Missing email username or password " });
      }

      //  Check for existing user
      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(409).json({
          err: "User already exists. Please log in or reset your password.",
        });
      }

      const hashedPassword = await hash(password, 12);

      // Tokens
      const accessToken = generateToken(email);
      const refreshToken = generateRefreshToken(email);
      const accountVerificationToken = generateAccountVerificationToken(email);

      // Save user
      const userDoc = new User({
        email,
        username,
        password: hashedPassword,
        active: false,
        refreshToken,
      });
      await userDoc.save();
      const id = userDoc._id;

      // 🍪 Set auth cookies
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1h
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
      });
      res.cookie("account_verification", accountVerificationToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      });
      const otp = generateOTP();
      await emailType("verify", email, otp);
      await saveVerificationEmailOtp(email, otp);
      res.status(201).json({
        message: "User registered successfully",
        verify: false,
        redirectTo: `https://buttnetworks.com/Account-verification?email=${email}`,
      });
    } catch (err) {
      console.error("❌ Signup error:", err);
      return res.status(500).json({ err: "Server error during signup 💥" });
    }
  });
};
