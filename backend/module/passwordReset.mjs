// passwordResetController.mjs
import { emailType } from "./mail.mjs";
import mongoose from "mongoose";
import reset from "../../Database/passwordReset.mjs";
import {
  generatePasswordResetToken,
  validatePasswordResetToken,
} from "./jwt.mjs";
import { decodeTokenSafely } from "./jwt.mjs";
import { sendPasswordResetConfirmation } from "./mail.mjs";
import { hash } from "./hasing.mjs";

export const sendResetPassword = async (req, res) => {
  try {
    // Dynamically import User *after* mongoose.connect() has run
    const { default: User } = await import("../../Database/userData.mjs");

    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ err: "Email is required" });
    }

    console.log("📡 ReadyState before query:", mongoose.connection.readyState);
    console.log("📦 DB Name:", mongoose.connection.name);
    console.log(
      "📁 Collections:",
      await mongoose.connection.db.listCollections().toArray()
    );

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .send({ msg: "If that email exists, we sent a reset link " });
    }

    const resetToken = generatePasswordResetToken(user.email);
    const passwordReset = new reset({ email, resetToken });
    await passwordReset.save();

    await emailType("forgot", email, resetToken);
    return res.status(200).send({ msg: "Password reset link sent " });
  } catch (err) {
    console.error("Reset error:", err);
    return res.status(500).send({ err: "Something went wrong " });
  }
};

export const validateResetRequest = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).send({ err: "Invalid request", auth: false });
    }
    const valid = validatePasswordResetToken(token);
    if (!valid) {
      return res.status(403).send({ err: "Token is not valid", auth: false });
    }

    const payload = decodeTokenSafely(token);
    const email = payload.email;

    const userRequest = await reset.findOne({ email }).lean();
    if (!userRequest) {
      return res
        .status(403)
        .send({ err: "Your token is expired try again!", auth: false });
    }

    res.cookie("reset", userRequest.resetToken, {
      httpOnly: true,
      secure: false, // change to true in prod
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).send({ msg: "Token valid, cookie set" });
  } catch (err) {
    console.error("Validate reset error:", err);
    return res.status(500).send({ err: "Something went wrong" });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).send({ err: "Invalid request" });
    }

    const valid = validatePasswordResetToken(token);
    if (!valid) {
      return res.status(403).send({ err: "Session expired, try again!" });
    }

    const { default: User } = await import("../../Database/userData.mjs");
    const payload = decodeTokenSafely(token);
    const email = payload.email;

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).send({ err: "User not found" });
    }

    const samePass = await import("bcrypt").then((bc) =>
      bc.compare(newPassword, user.password)
    );
    if (samePass) {
      return res
        .status(400)
        .send({ msg: "Your new password can’t be the same as your old one." });
    }

    const hashedPassword = await hash(newPassword);
    const result = await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 1) {
      await sendPasswordResetConfirmation(email);
      return res.status(200).send({ msg: "Password was reset successfully" });
    } else {
      return res.status(500).send({ err: "Password update failed" });
    }
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).send({ err: "Something went wrong" });
  }
};
