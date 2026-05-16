import crypto from "crypto";

/** Raw token sent to user; store only the SHA-256 hash in the database. */
export function createResetToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

export function hashResetToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
