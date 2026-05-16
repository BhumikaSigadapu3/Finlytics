/** JWT / SSO session settings (30-day single sign-on) */
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";
export const SSO_SESSION_DAYS = Number(process.env.SSO_SESSION_DAYS) || 30;
