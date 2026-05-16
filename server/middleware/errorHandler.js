/**
 * Centralized error handler — keep controllers thin.
 */
export function errorHandler(err, req, res, _next) {
  console.error(err);
  const status = err.statusCode || err.status || 500;
  const message =
    err.message || (status === 500 ? "Internal server error" : "Error");
  if (err.name === "ValidationError") {
    const msgs = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({ message: msgs.join(", ") || message });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: "Duplicate field value" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource id" });
  }
  res.status(status).json({ message });
}
