import "dotenv/config";
import jwt from "jsonwebtoken";
import User from "../../Database/userData.mjs";
import { jwtDecode } from "jwt-decode";
const SECRET_JWT_KEY = process.env.JWT_KEY;
const SECRET_REFRESH_KEY = process.env.REFRESH_KEY;
const SECRET_ACCOUNT_VERIFICATION_KEY = process.env.ACCOUNT_VERIFICATION_TOKEN;
const SECRET_PASSWORD_RESET_KEY = process.env.PASSWORD_RESET_TOKEN;

export const generateToken = (email) => {
  const payload = {
    email: email,
    type: "access",
  };

  return jwt.sign(payload, SECRET_JWT_KEY, { expiresIn: "1h" });
};
export const generateAccountVerificationToken = (email) => {
  const payload = {
    email: email,
    type: "Account Verification",
  };

  return jwt.sign(payload, SECRET_ACCOUNT_VERIFICATION_KEY, {
    expiresIn: "1h",
  });
};
export const validateAccountVerificationToken = async (token) => {
  const validate = verifyJwtToken(token, SECRET_ACCOUNT_VERIFICATION_KEY);
  if (!validate.valid) return false;
  return validate.decoded; // ✅ return decoded info!
};

const verifyJwtToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return { valid: true, expired: false, decoded };
  } catch (err) {
    return {
      valid: false,
      expired: err.name === "TokenExpiredError",
      decoded: null,
    };
  }
};
export const generateRefreshToken = (email) => {
  const payload = {
    email: email,
    type: "refresh",
  };
  return jwt.sign(payload, SECRET_REFRESH_KEY, { expiresIn: "30d" });
};
export const generatePasswordResetToken = (email) => {
  const payload = {
    email: email,
    type: "reset",
  };
  return jwt.sign(payload, SECRET_PASSWORD_RESET_KEY, { expiresIn: "15min" });
};

export const validatePasswordResetToken = async (resetToken) => {
  const user = await User.findOne({ resetToken });
  const validate = verifyJwtToken(resetToken, SECRET_PASSWORD_RESET_KEY);
  if (!validate.valid) return null;
  return user || null;
};

const validateRefreshToken = async (refreshToken) => {
  const user = await User.findOne({ refreshToken });
  const validate = verifyJwtToken(refreshToken, SECRET_REFRESH_KEY);
  if (!validate.valid) return null;
  return user || null;
};

export const authenticate = async (req, res, next) => {
  const openTypes = [
    "signup",
    "login",
    "validateCaptcha",
    "otp/auth",
    "otp/resend",
    "password/reset/mail",
    "password/reset/valid/check",
    "password/reset",
    "contact/form",
    "admin/contact",
  ];
  if (openTypes.includes(req.body?.type)) {
    return next();
  }
  const token = req.cookies.token;
  const refresh_token = req.cookies.refresh_token;
  

  // Step 1: No access token
  if (!token) {
    if (!refresh_token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Step 2: Validate refresh token
    const validatedUser = await validateRefreshToken(refresh_token);

    if (!validatedUser) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // Step 3: Generate new access token
    const newAccessToken = generateToken(validatedUser);

    // Step 4: Set new token as cookie
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });

    // Optional: You can continue the request or just respond here
    req.user = {
      id: validatedUser._id.toString(),
      email: validatedUser.email,
    };

    return next(); // ✅ Let them through after refresh
  }

  // Step 5: Validate access token
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const decodeTokenSafely = (token) => {
  try {
    if (!token || typeof token !== "string" || token.split(".").length !== 3) {
      throw new Error("Invalid token format 😵");
    }

    const decoded = jwtDecode(token);
    return decoded;
  } catch (err) {
    console.error("❌ Failed to decode token:", err.message);
    return null; // or throw custom error if you wanna handle it upstream
  }
};
