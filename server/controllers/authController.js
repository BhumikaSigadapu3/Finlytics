import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ROLES } from "../constants/roles.js";
import { SSO_SESSION_DAYS } from "../config/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authResponse, publicUser } from "../utils/token.js";
import { createResetToken, hashResetToken } from "../utils/resetToken.js";
import { sendPasswordResetEmail } from "../utils/mail.js";

const RESET_MS = 60 * 60 * 1000; // 1 hour

function clientBaseUrl() {
  const origin = process.env.CLIENT_ORIGIN?.split(",")[0]?.trim();
  return origin || "http://localhost:5173";
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email, and password" });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ message: "Email already registered" });
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: ROLES.USER,
  });
  res.status(201).json(authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json(authResponse(user));
});

export const getMe = asyncHandler(async (req, res) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SSO_SESSION_DAYS);
  res.json({
    user: publicUser(req.user),
    sso: { sessionDays: SSO_SESSION_DAYS, expiresAt: expiresAt.toISOString() },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({ message: "Logged out. Clear your client token to end the SSO session." });
});

/** Request password reset link (always same response to avoid email enumeration). */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Please provide your email address" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  const message =
    "If an account exists for that email, you will receive password reset instructions shortly.";

  if (user) {
    const { raw, hashed } = createResetToken();
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = new Date(Date.now() + RESET_MS);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${clientBaseUrl()}/reset-password?token=${raw}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl });
  }

  res.json({ message });
});

/** Set new password using token from email/link. */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: "Token and new password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const hashed = hashResetToken(token);
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset link" });
  }

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    message: "Password updated successfully. You can sign in with your new password.",
  });
});
