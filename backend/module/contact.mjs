import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// ✨ POST handler with full try/catch block
const conactUs = async (req, res) => {
  try {
    const { name, email, message, tel } = req.body;
    // // Save to DB
    // const useDoc = new UserContact({ name, email, tel, message });
    // await useDoc.save(); // ✅ Mongoose ready because we wait until `.then()` before starting the server
    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: 'op422010@gmail.com',
      subject: "📨 New Contact Form Message",
      html: `
  <div style="background-color: #0f172a; color: #f9fafb; padding: 40px 30px; border-radius: 14px; font-family: 'Segoe UI', Roboto, sans-serif; font-size: 17px; line-height: 1.7;">
    
    <div style="border-bottom: 2px solid #1e293b; padding-bottom: 15px; margin-bottom: 25px;">
      <h1 style="color: #38bdf8; font-size: 26px; margin: 0;">📨 New Contact Message</h1>
      <p style="font-size: 14px; color: #94a3b8;">From Wahb’s Secure Form</p>
    </div>

    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0;"><strong style="color: #93c5fd;">👤 Name:</strong></td>
        <td style="padding: 10px 0;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong style="color: #93c5fd;">📧 Email:</strong></td>
        <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong style="color: #93c5fd;">📱 Phone:</strong></td>
        <td style="padding: 10px 0;">${tel}</td>
      </tr>
    </table>

    <div style="margin-top: 30px;">
      <p style="margin-bottom: 8px;"><strong style="color: #93c5fd;">📝 Message:</strong></p>
      <div style="background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #334155;">
        <p style="white-space: pre-line; margin: 0; color: #f3f4f6; font-size: 16px;">${message}</p>
      </div>
    </div>

    <div style="margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-size: 13px; color: #64748b;">
      🔒 This message was sent automatically from <strong style="color: #facc15;">Wahb’s Secure Contact System</strong>. Please do not reply to this email.
    </div>

  </div>
`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "✅ Email sent + data saved!" });
  } catch (err) {
    console.error("❌ Error in POST /:", err);
    res.status(500).json({ message: "Something went wrong 💥" });
  }
};

export default conactUs
