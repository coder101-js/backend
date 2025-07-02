import rateLimit from "express-rate-limit";
import { signup } from "../module/signup.mjs";
import { login } from "../module/login.mjs";
import { verifyOtp, resendOtp } from "../module/mail.mjs";
import {
  sendResetPassword,
  validateResetRequest,
  changeUserPassword,
} from "../module/passwordReset.mjs";
import conactUs from '../module/contact.mjs'
// 🔒 Rate limiters
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many Request",
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 5,
  message: "Too many login attempts",
  legacyHeaders: false,
});
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests. Please try again later.",
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: "OTP spamming detected",
  legacyHeaders: false,
});

// 🔁 Utility to apply limiter before handler
const withLimiter = (limiter, handler) => {
  return (req, res, next) => {
    limiter(req, res, (err) => {
      if (err) return; // limiter already sent response
      handler(req, res, next);
    });
  };
};

// 🚀 Middleman controller with rate limits
export const middleManController = (req, res) => {
  const { type } = req.body || {};
  if (!type) {
    return res.status(400).json({ error: "Missing 'type' in request body 😵‍💫" });
  }

  switch (type) {
    case "signup":
      return withLimiter(defaultLimiter, signup)(req, res);
    case "login":
      return withLimiter(loginLimiter, login)(req, res);
    case "otp/auth":
      return withLimiter(otpLimiter, verifyOtp)(req, res);
    case "otp/resend":
      return withLimiter(otpLimiter, resendOtp)(req, res);
    case "password/reset/mail":
      return withLimiter(resetLimiter, sendResetPassword)(req, res);
    case "password/reset/valid/check":
      return withLimiter(resetLimiter, validateResetRequest)(req, res);
    case "password/reset":
      return withLimiter(resetLimiter, changeUserPassword)(req, res);
    case "contact/form":
      return withLimiter(defaultLimiter, conactUs)(req, res);
    default:
      return res.status(400).send("Type not found 😐");
  }
};
