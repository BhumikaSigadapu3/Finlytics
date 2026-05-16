import { ROLE_LIST } from "../constants/roles.js";

/**
 * Restrict route to one or more roles (use after protect).
 * @param  {...string} allowedRoles
 */
export function authorize(...allowedRoles) {
  const roles = allowedRoles.length ? allowedRoles : ROLE_LIST;
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}
