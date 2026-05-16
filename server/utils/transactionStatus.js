import { Transaction } from "../models/Transaction.js";
import { STATUS } from "../constants/transactionStatus.js";

/** Calendar start of today (server local time). */
export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** End of today for inclusive date comparisons. */
export function endOfToday() {
  const d = startOfToday();
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Future calendar dates → scheduled; today or past → completed. */
export function resolveStatusFromDate(date) {
  const txDay = new Date(date);
  txDay.setHours(0, 0, 0, 0);
  return txDay > startOfToday() ? STATUS.SCHEDULED : STATUS.COMPLETED;
}

/** Backfill status on legacy documents, then promote due scheduled rows. */
export async function promoteDueScheduledTransactions(userId) {
  const legacy = await Transaction.find({
    user: userId,
    $or: [{ status: { $exists: false } }, { status: null }],
  });
  for (const doc of legacy) {
    doc.status = resolveStatusFromDate(doc.date);
    await doc.save({ validateBeforeSave: false });
  }

  const result = await Transaction.updateMany(
    {
      user: userId,
      status: STATUS.SCHEDULED,
      date: { $lte: endOfToday() },
    },
    { $set: { status: STATUS.COMPLETED } }
  );
  return result.modifiedCount;
}

export function formatTransaction(doc) {
  const t = doc.toObject ? doc.toObject() : doc;
  return {
    id: t._id,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.date,
    description: t.description,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}
