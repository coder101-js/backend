import nodemailer from "nodemailer";
import { hashOTP, isValidOTP } from "./hasing.mjs";
import Otp from "../../Database/otp.mjs";
import User from "../../Database/userData.mjs";
import { validateAccountVerificationToken } from "./jwt.mjs";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const generateOTP = (length = 6) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Only digits
  }
  return otp;
};

export const emailType = async (type, email, codeOrToken) => {
  switch (type) {
    case "verify":
      await sendVerificationEmail(email, codeOrToken);
      break;
    case "forgot":
      await sendPasswordResetEmail(email, codeOrToken);
      break;
    default:
      throw new Error("Unknown email type 🤷‍♂️");
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  console.log("Mongoose readyState:", mongoose.connection.readyState);
  console.log("User model:", User);

  const info = await transporter.sendMail({
    from: `"ButtNetworks" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your ButtNetworks Password 🔒",
    replyTo: process.env.RECEIVER_EMAIL,
    headers: {
      "X-Auto-Response-Suppress": "All",
      "Auto-Submitted": "auto-generated",
      Precedence: "bulk",
    },
    html: `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 30px 0;">
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
      <div style="background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 1.8rem;">ButtNetworks</h1>
        <p style="margin: 5px 0 0; font-size: 1rem;">Reset Your Password</p>
      </div>
      <div style="padding: 30px 24px; text-align: center;">
        <p style="font-size: 1.05rem; color: #333;">Hi there,</p>
        <p style="font-size: 1rem; color: #555; margin-bottom: 30px;">
          We received a request to reset the password for your ButtNetworks account. Click the button below to continue:
        </p>
        <a href="${
          process.env.FRONTEND_URL
        }?token=${resetToken}" style="display: inline-block; padding: 14px 24px; background-color: #2575fc; color: #fff; text-decoration: none; border-radius: 6px; font-size: 1rem;">
          Reset Password
        </a>
        <p style="margin-top: 30px; font-size: 0.95rem; color: #777;">
          This link will expire in 15 minutes. <br />
          If you did not request a password reset, please ignore this message.
        </p>
      </div>
      <div style="background-color: #f9f9f9; text-align: center; padding: 20px; font-size: 0.85rem; color: #aaa;">
        &copy; ${new Date().getFullYear()} ButtNetworks. All rights reserved.
      </div>
    </div>
  </div>
    `,
  });
};

export const sendPasswordResetConfirmation = async (email) => {
  const info = await transporter.sendMail({
    from: `"ButtNetworks" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your ButtNetworks Password 🔒",
    replyTo: process.env.RECEIVER_EMAIL,
    headers: {
      "X-Auto-Response-Suppress": "All",
      "Auto-Submitted": "auto-generated",
      Precedence: "bulk",
    },
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; padding: 40px 0;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); overflow: hidden;">
        <div style="background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); padding: 28px 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">ButtNetworks</h1>
          <p style="margin: 8px 0 0; font-size: 1.1rem; font-weight: 500;">Password Successfully Reset 🔒</p>
        </div>
        <div style="padding: 36px 32px; text-align: center; color: #333;">
          <p style="font-size: 1.1rem; margin: 0 0 15px;">Hey there 👋,</p>
          <p style="font-size: 1rem; line-height: 1.5; color: #555; margin-bottom: 30px;">
            Your password has been updated successfully. If this was you, you're good to go! ✅
          </p>
          <p style="font-size: 0.9rem; color: #777; margin-bottom: 35px;">
            If you didn’t request this change, please contact our support team immediately or reset your password again:
          </p>
          <a href="${process.env.FRONTEND_URL}/reset-password"
             style="
               display: inline-block;
               padding: 14px 28px;
               background-color: #2575fc;
               color: #fff;
               font-weight: 600;
               font-size: 1rem;
               border-radius: 8px;
               text-decoration: none;
               box-shadow: 0 4px 12px rgba(37,117,252,0.5);
               transition: background-color 0.3s ease, box-shadow 0.3s ease;
             "
             onmouseover="this.style.backgroundColor='#1b59d8'; this.style.boxShadow='0 6px 18px rgba(27,89,216,0.7)';"
             onmouseout="this.style.backgroundColor='#2575fc'; this.style.boxShadow='0 4px 12px rgba(37,117,252,0.5)';"
          >
            Reset Password Again
          </a>
        </div>
        <div style="background-color: #fafafa; text-align: center; padding: 22px 16px; font-size: 0.85rem; color: #999;">
          &copy; ${new Date().getFullYear()} ButtNetworks. All rights reserved.
        </div>
      </div>
    </div>
    `,
  });
};

const sendVerificationEmail = async (email, OTP) => {
  const info = await transporter.sendMail({
    from: `"ButtNetworks " <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your ButtNetworks Account 🚀",
    replyTo: process.env.RECEIVER_EMAIL,
    headers: {
      "X-Auto-Response-Suppress": "All",
      "Auto-Submitted": "auto-generated",
      Precedence: "bulk",
    },
    html: `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 30px 0;">
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
      <div style="background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 1.8rem;">ButtNetworks</h1>
        <p style="margin: 5px 0 0; font-size: 1rem;">Verify Your Account 💼</p>
      </div>
      <div style="padding: 30px 24px; text-align: center;">
        <p style="font-size: 1.05rem; color: #333;">Hey there 👋</p>
        <p style="font-size: 1rem; color: #555; margin-bottom: 30px;">
          Thanks for signing up! Use the 6-digit code below to verify your ButtNetworks account:
        </p>
        <div style="display: inline-block; padding: 16px 24px; background-color: #f1f4ff; border-radius: 8px; font-size: 1.8rem; font-weight: bold; letter-spacing: 8px; color: #2575fc;">
          ${OTP}
        </div>
        <p style="margin-top: 30px; font-size: 0.95rem; color: #777;">
          This code will expire in 10 minutes. <br>If you didn’t request this, you can safely ignore it.
        </p>
      </div>
      <div style="background-color: #f9f9f9; text-align: center; padding: 20px; font-size: 0.85rem; color: #aaa;">
        &copy; ${new Date().getFullYear()} ButtNetworks. All rights reserved.
      </div>
    </div>
  </div>
  `,
  });
};
export const saveVerificationEmailOtp = async (email, OTP) => {
  await Otp.deleteMany({ email }); //del old OTP
  const hashedOtp = hashOTP(OTP);
  const otpDoc = new Otp({
    email: email,
    otp: hashedOtp,
  });
  await otpDoc.save();
};

export const verifyOtp = async (req, res) => {
  console.log(req.cookies.account_verification);
  try {
    const valid = await validateAccountVerificationToken(
      req.cookies.account_verification
    );
    console.log(valid);
    if (!valid) {
      return res.status(403).json({
        msg: "Invalid token",
        redirectTo: `http://localhost:5500/index.html`,
      });
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }
  try {
    const userOtp = await Otp.findOne({ email });
    if (!userOtp) {
      return res
        .status(403)
        .json({ auth: false, message: "OTP expired or not found." });
    }

    const isValid = isValidOTP(otp, userOtp.otp); // plain vs hashed

    if (!isValid) {
      return res.status(403).json({ auth: false, message: "Invalid OTP." });
    }

    // ✅ Verified! You can optionally delete the OTP now
    const updatedUser = await User.findOneAndUpdate(
      { email }, // Find by email
      { $set: { active: true } }, // Update the 'active' field
      { new: true } // Return updated doc
    );
    await Otp.deleteMany({ email });
    res.clearCookie("account_verification", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    return res
      .status(200)
      .json({ auth: true, message: "OTP verified successfully." });
  } catch (err) {
    console.error("❌ OTP Verify Error:", err.message);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  const OTP = generateOTP(); // You must have this function available

  try {
    // 🔄 Remove previous OTPs
    await Otp.deleteMany({ email });

    // ✉️ Send email
    await sendVerificationEmail(email, OTP);

    // 🔐 Hash and save
    const hashedOtp = hashOTP(OTP);
    const otpDoc = new Otp({ email, otp: hashedOtp });
    await otpDoc.save();

    return res
      .status(200)
      .json({ success: true, message: "OTP resent successfully." });
  } catch (err) {
    console.error("❌ Resend OTP Error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to resend OTP." });
  }
};
