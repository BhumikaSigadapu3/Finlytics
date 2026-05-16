import { Transaction } from "../models/Transaction.js";
import { STATUS } from "../constants/transactionStatus.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { promoteDueScheduledTransactions } from "../utils/transactionStatus.js";

function baseMatch(userId, startDate, endDate) {
  const match = { user: userId, status: STATUS.COMPLETED };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
  }
  return match;
}

/** Totals: income, expense, balance — completed transactions only */
export const getSummary = asyncHandler(async (req, res) => {
  await promoteDueScheduledTransactions(req.user._id);
  const { startDate, endDate } = req.query;
  const match = baseMatch(req.user._id, startDate, endDate);
  const agg = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);
  let income = 0;
  let expense = 0;
  for (const row of agg) {
    if (row._id === "income") income = row.total;
    if (row._id === "expense") expense = row.total;
  }
  res.json({
    income,
    expense,
    balance: income - expense,
    startDate: startDate || null,
    endDate: endDate || null,
  });
});

/** Pie chart: completed expenses per category */
export const getCategoryBreakdown = asyncHandler(async (req, res) => {
  await promoteDueScheduledTransactions(req.user._id);
  const { startDate, endDate } = req.query;
  const match = { ...baseMatch(req.user._id, startDate, endDate), type: "expense" };
  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);
  res.json({
    data: rows.map((r) => ({ category: r._id, amount: r.total })),
  });
});

/** Line chart: daily completed expense totals */
export const getSpendingTrends = asyncHandler(async (req, res) => {
  await promoteDueScheduledTransactions(req.user._id);
  const { startDate, endDate } = req.query;
  const match = { ...baseMatch(req.user._id, startDate, endDate), type: "expense" };
  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json({
    data: rows.map((r) => ({ date: r._id, amount: r.total })),
  });
});
