import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    active: { type: Boolean, required: true },
    refreshToken: { type: String, required: true },
  },
  { timestamps: true }
);
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model("User", userSchema);
export default User;
 