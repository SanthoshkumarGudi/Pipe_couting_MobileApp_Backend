const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const link = `http://localhost:5000/api/auth/verify-email/${token}`;

  await transporter.sendMail({
    from: "Your App <no-reply@yourapp.com>",
    to: email,
    subject: "Verify your email",
    html: `
      <h3>Email Verification</h3>
      <p>Click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
    `,
  });
};

const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${process.env.BACKEND_URL}/api/auth/reset-password-redirect?token=${token}`;
  
  // Better HTML – make button look nice and clearly clickable
  await transporter.sendMail({
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password (expires in 1 hour):</p>
        
        <a href="${resetLink}" 
           style="display: inline-block; background-color: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 20px 0;">
          Reset Password Now
        </a>
        
        <p style="color: #555; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link:<br>
          <strong>${resetLink}</strong>
        </p>
        <p style="color: #888; font-size: 13px;">
          This link was sent because someone requested a password reset for this email. If it wasn't you, ignore this message.
        </p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail};
