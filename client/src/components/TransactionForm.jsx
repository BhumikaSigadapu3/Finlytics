import { useEffect, useMemo, useState } from "react";
import DateInput from "./DateInput.jsx";

const empty = {
  amount: "",
  type: "expense",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  description: "",
};

function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const picked = new Date(dateStr);
  picked.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return picked > today;
}

export default function TransactionForm({
  categories,
  initial,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (initial) {
      setForm({
        amount: String(initial.amount),
        type: initial.type,
        category: initial.category,
        date: new Date(initial.date).toISOString().slice(0, 10),
        description: initial.description || "",
      });
    } else {
      setForm(empty);
    }
  }, [initial]);

  const willSchedule = useMemo(() => isFutureDate(form.date), [form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      description: form.description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-600 dark:text-slate-400">Amount</span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.amount}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600 dark:text-slate-400">Type</span>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-slate-600 dark:text-slate-400">Category</span>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-slate-600 dark:text-slate-400">Date</span>
          <DateInput
            name="date"
            required
            value={form.date}
            onChange={handleChange}
            containerClassName="mt-1"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
          {willSchedule && (
            <p className="mt-1.5 text-xs text-violet-600 dark:text-violet-400">
              Future transactions will be scheduled and won&apos;t affect your balance until that date.
            </p>
          )}
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-slate-600 dark:text-slate-400">Description</span>
        <textarea
          name="description"
          rows={2}
          value={form.description}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "Saving…" : initial ? "Update" : willSchedule ? "Schedule" : "Add"}
        </button>
      </div>
    </form>
  );
}
