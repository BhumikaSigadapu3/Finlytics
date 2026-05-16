import { Transaction } from "../models/Transaction.js";
import { PREDEFINED_CATEGORIES, TRANSACTION_TYPES } from "../constants/categories.js";
import { TRANSACTION_STATUSES } from "../constants/transactionStatus.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  resolveStatusFromDate,
  promoteDueScheduledTransactions,
  formatTransaction,
} from "../utils/transactionStatus.js";

function parseFilters(query) {
  const { category, type, startDate, endDate, status } = query;
  const filter = {};
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (status) {
    if (!TRANSACTION_STATUSES.includes(status)) {
      return { error: "Invalid status. Use completed or scheduled." };
    }
    filter.status = status;
  }
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }
  return { filter };
}

export const listCategories = asyncHandler(async (req, res) => {
  res.json({ categories: PREDEFINED_CATEGORIES, types: TRANSACTION_TYPES });
});

export const getTransactions = asyncHandler(async (req, res) => {
  await promoteDueScheduledTransactions(req.user._id);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const parsed = parseFilters(req.query);
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }
  const filter = { user: req.user._id, ...parsed.filter };

  const sort =
    req.query.status === "scheduled" ? { date: 1 } : { date: -1 };

  const [items, total] = await Promise.all([
    Transaction.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    data: items.map((t) => formatTransaction(t)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, description } = req.body;
  if (amount == null || !type || !category || !date) {
    return res.status(400).json({ message: "amount, type, category, and date are required" });
  }
  if (!PREDEFINED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }
  if (!TRANSACTION_TYPES.includes(type)) {
    return res.status(400).json({ message: "Invalid type" });
  }

  const txDate = new Date(date);
  const status = resolveStatusFromDate(txDate);

  const doc = await Transaction.create({
    user: req.user._id,
    amount: Number(amount),
    type,
    category,
    date: txDate,
    description: description ?? "",
    status,
  });
  res.status(201).json(formatTransaction(doc));
});

export const getTransaction = asyncHandler(async (req, res) => {
  await promoteDueScheduledTransactions(req.user._id);
  const doc = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  res.json(formatTransaction(doc));
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, description } = req.body;
  const doc = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!doc) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  if (category != null && !PREDEFINED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }
  if (type != null && !TRANSACTION_TYPES.includes(type)) {
    return res.status(400).json({ message: "Invalid type" });
  }
  if (amount != null) doc.amount = Number(amount);
  if (type != null) doc.type = type;
  if (category != null) doc.category = category;
  if (date != null) doc.date = new Date(date);
  if (description != null) doc.description = description;
  doc.status = resolveStatusFromDate(doc.date);
  await doc.save();
  res.json(formatTransaction(doc));
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const result = await Transaction.deleteOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  res.status(204).send();
});
