import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { ROLES, ROLE_LIST } from "../constants/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { publicUser } from "../utils/token.js";

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
  res.json({
    data: users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    })),
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role || !ROLE_LIST.includes(role)) {
    return res.status(400).json({ message: "Valid role required: admin or user" });
  }
  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: "User not found" });
  }
  if (target._id.equals(req.user._id) && role !== ROLES.ADMIN) {
    return res.status(400).json({ message: "You cannot remove your own admin role" });
  }
  target.role = role;
  await target.save();
  res.json({ user: publicUser(target) });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: "User not found" });
  }
  if (target._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }
  await Transaction.deleteMany({ user: target._id });
  await target.deleteOne();
  res.status(204).send();
});

export const getSystemStats = asyncHandler(async (_req, res) => {
  const [userCount, transactionCount, admins] = await Promise.all([
    User.countDocuments(),
    Transaction.countDocuments(),
    User.countDocuments({ role: ROLES.ADMIN }),
  ]);
  res.json({ userCount, transactionCount, adminCount: admins });
});
