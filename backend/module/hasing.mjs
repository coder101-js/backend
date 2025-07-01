import bcrypt from "bcryptjs";
import crypto from "crypto";

export const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};
export const isValidOTP = (inputOtp, storedHashedOtp) => {
  return hashOTP(inputOtp) === storedHashedOtp;
};
export const hash = async (password, salt = 12) => {
  try {
    const SALT = await bcrypt.genSalt(salt);
    const hasedPassword = await bcrypt.hash(password, SALT);
    return hasedPassword;
  } catch (err) {
    console.error("error hasing password!");
    return false;
  }
};

export const compare = async (rawPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(rawPassword, hashedPassword);
  } catch (err) {
    console.error(" Error comparing passwords:", err);
    return false;
  }
};
