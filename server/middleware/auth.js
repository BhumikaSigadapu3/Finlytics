import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * Verifies JWT from Authorization header and attaches req.user.
 */
export async function protect(req, res, next) {
  let token;
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    token = auth.slice(7);
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
}
