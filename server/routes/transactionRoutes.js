import { Router } from "express";
import {
  listCategories,
  getTransactions,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/categories", protect, listCategories);
router.get("/", protect, getTransactions);
router.post("/", protect, createTransaction);
router.get("/:id", protect, getTransaction);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

export default router;
