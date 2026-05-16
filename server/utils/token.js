import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, SSO_SESSION_DAYS } from "../config/auth.js";

export function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function authResponse(user) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SSO_SESSION_DAYS);
  return {
    token: signToken(user),
    user: publicUser(user),
    sso: {
      sessionDays: SSO_SESSION_DAYS,
      expiresAt: expiresAt.toISOString(),
    },
  };
}
