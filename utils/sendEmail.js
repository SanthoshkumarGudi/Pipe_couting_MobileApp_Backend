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

module.exports = { sendVerificationEmail };
