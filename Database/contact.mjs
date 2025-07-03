import mongoose from "mongoose";

export const ContactSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true  },
  message: { type: String, required: true  },
});

const Contact = mongoose.model("contact", ContactSchema);
