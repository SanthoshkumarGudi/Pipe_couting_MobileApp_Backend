const sgMail = require("@sendgrid/mail");

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, token) => {
  const link = `${process.env.BACKEND_URL}/api/auth/verify-email/${token}`;
  console.log("inside verification email");

  const msg = {
    to: email,
    from: process.env.EMAIL_USER, // must be verified sender
    subject: "Verify your email",
    html: `
      <h3>Email Verification</h3>
      <p>Click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
    `,
  };

  await sgMail.send(msg);
};

const sendResetPasswordEmail = async (email, token) => {
  // const resetLink = `${process.env.BACKEND_URL}/api/auth/reset-password-redirect?token=${token}`;
    const resetLink = `${process.env.BACKEND_URL}/api/auth/reset-password/${token}`;

  console.log("inside reset email and the token is ", token);


  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
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
  };

  await sgMail.send(msg)
  .then(() => {
    console.log("Email sent successfully");
  })
  .catch((error) => {
    console.error("SendGrid Error:");
    console.error(error.response?.body || error);
  });

};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
