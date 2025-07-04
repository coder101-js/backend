import mongoose from "mongoose";

const ContactSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    message: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

export const Contact = mongoose.model("contact", ContactSchema);
