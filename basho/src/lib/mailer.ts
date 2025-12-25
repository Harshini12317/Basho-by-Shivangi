import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  to: string,
  code: string
) {
  await transporter.sendMail({
    from: `"Basho" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your email - Basho",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 4px;">${code}</h1>
        <p>This code is valid for 10 minutes.</p>
      </div>
    `,
  });
}
