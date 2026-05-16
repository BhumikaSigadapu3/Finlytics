/**
 * Optional SMTP email. If not configured, reset links are logged in development.
 */
export async function sendPasswordResetEmail({ to, resetUrl }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.log("\n--- Password reset (SMTP not configured) ---");
      console.log(`To: ${to}`);
      console.log(`Link: ${resetUrl}\n`);
    }
    return { sent: false, devLogged: true };
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject: "Reset your Finlytics password",
    text: `Reset your password using this link (valid for 1 hour):\n\n${resetUrl}`,
    html: `<p>Reset your password using this link (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  return { sent: true };
}
