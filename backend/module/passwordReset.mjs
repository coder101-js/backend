import { emailType } from "./mail.mjs";
import User from "../../Database/userData.mjs";
import reset from "../../Database/passwordReset.mjs";
import { decodeTokenSafely } from "./jwt.mjs";
import mongoose from "mongoose";
import {
  generatePasswordResetToken,
  validatePasswordResetToken,
} from "./jwt.mjs";
import { sendPasswordResetConfirmation } from "./mail.mjs";
import { hash } from "./hasing.mjs";

export const sendResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ err: "Email is required" });
    }
    console.log("📦 DB Name:", mongoose.connection.name);
    console.log(
      "📁 Collections:",
      await mongoose.connection.db.listCollections().toArray()
    );

    const user = await User.findOne({ email });

    if (!user) {
      // Don't expose if user doesn't exist
      return res
        .status(200)
        .send({ msg: "If that email exists, we sent a reset link " });
    }

    const resetToken = generatePasswordResetToken(user.email);
    const passwordReset = new reset({
      email,
      resetToken,
    });
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
      secure: false,
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
    });
  } catch (err) {
    return res.status(500).send({ err: "Something went wrong" });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(403).send({ err: "Token is not valid" });
    }
    const valid = validatePasswordResetToken(token);
    if (!valid) {
      return res.status(403).send({ err: "session expired try again!" });
    }
    const payload = decodeTokenSafely(token);
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).send({ err: "Credentials not found" });
    }

    const email = payload.email;
    const user = await User.findOne({ email });
    const samePass = await bcrypt.compare(newPassword, user.password);
    if (samePass) {
      return res
        .status(200)
        .send({ msg: "Your new password can’t be the same as your old one." });
    }
    const hashedPassword = await hash(newPassword);
    const result = await User.updateOne(
      { email: payload.email },
      { $set: { password: hashedPassword } }
    );
    if (result.modifiedCount === 1) {
      sendPasswordResetConfirmation(email);
      return res.status(200).send({ msg: "Password was reset successfully" });
    } else {
      return res.status(500).send({ err: "Password update failed" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: "Something went wrong" });
  }
};
