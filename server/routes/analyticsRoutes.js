import { Router } from "express";
import {
  getSummary,
  getCategoryBreakdown,
  getSpendingTrends,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/summary", protect, getSummary);
router.get("/category-breakdown", protect, getCategoryBreakdown);
router.get("/spending-trends", protect, getSpendingTrends);

export default router;
