import mongoose from "mongoose";

const passwordResetSchema = mongoose.Schema({
  email: { type: String, required: true },
  resetToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 },
});

const reset = mongoose.model("passwordReset", passwordResetSchema);
export default reset;
