import mongoose from "mongoose";
import { PREDEFINED_CATEGORIES, TRANSACTION_TYPES } from "../constants/categories.js";
import { TRANSACTION_STATUSES } from "../constants/transactionStatus.js";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: TRANSACTION_TYPES },
    category: { type: String, required: true, enum: PREDEFINED_CATEGORIES },
    date: { type: Date, required: true, index: true },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: TRANSACTION_STATUSES,
      default: "completed",
      index: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, status: 1, date: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
