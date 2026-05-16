import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";
import {
  listUsers,
  updateUserRole,
  deleteUser,
  getSystemStats,
} from "../controllers/adminController.js";

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get("/stats", getSystemStats);
router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;
