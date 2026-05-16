import { useCallback, useEffect, useMemo, useState } from "react";
import * as tx from "../services/transactionService.js";
import Spinner from "../components/Spinner.jsx";
import TransactionForm from "../components/TransactionForm.jsx";
import TransactionTable from "../components/TransactionTable.jsx";
import DateInput from "../components/DateInput.jsx";
import { downloadCsv, transactionsToCsv } from "../utils/csv.js";

const filterFields = ["category", "type", "startDate", "endDate"];

export default function TransactionsPage() {
  const [categories, setCategories] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [completedPagination, setCompletedPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, editing: null });
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const sharedFilters = useMemo(() => {
    const q = {};
    if (filters.category) q.category = filters.category;
    if (filters.type) q.type = filters.type;
    if (filters.startDate) q.startDate = filters.startDate;
    if (filters.endDate) q.endDate = filters.endDate;
    return q;
  }, [filters]);

  const loadCategories = useCallback(async () => {
    const data = await tx.fetchCategories();
    setCategories(data.categories || []);
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [completedRes, scheduledRes] = await Promise.all([
        tx.fetchTransactions({
          ...sharedFilters,
          status: "completed",
          page: completedPagination.page,
          limit: completedPagination.limit,
        }),
        tx.fetchTransactions({
          ...sharedFilters,
          status: "scheduled",
          page: 1,
          limit: 50,
        }),
      ]);
      setCompleted(completedRes.data || []);
      setCompletedPagination((p) => ({ ...p, ...completedRes.pagination }));
      setScheduled(scheduledRes.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [sharedFilters, completedPagination.page, completedPagination.limit]);

  useEffect(() => {
    loadCategories().catch(() => {});
  }, [loadCategories]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    if (!filterFields.includes(name)) return;
    setFilters((f) => ({ ...f, [name]: value }));
    setCompletedPagination((p) => ({ ...p, page: 1 }));
  };

  const openCreate = () => setModal({ open: true, editing: null });
  const openEdit = (row) => setModal({ open: true, editing: row });
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSubmit = async (body) => {
    setSubmitting(true);
    try {
      if (modal.editing) {
        await tx.updateTransaction(modal.editing.id, body);
      } else {
        await tx.createTransaction(body);
      }
      closeModal();
      await loadTransactions();
    } catch (e) {
      setError(e.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await tx.deleteTransaction(id);
      await loadTransactions();
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const [completedRes, scheduledRes] = await Promise.all([
        tx.fetchTransactions({ ...sharedFilters, status: "completed", page: 1, limit: 500 }),
        tx.fetchTransactions({ ...sharedFilters, status: "scheduled", page: 1, limit: 500 }),
      ]);
      const csv = transactionsToCsv([
        ...(completedRes.data || []),
        ...(scheduledRes.data || []),
      ]);
      downloadCsv(`finlytics-transactions-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch (e) {
      setError(e.response?.data?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Completed activity affects your balance. Scheduled items are upcoming.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700 disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add transaction
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          <span className="text-slate-500 dark:text-slate-400">Category</span>
          <select
            name="category"
            value={filters.category}
            onChange={onFilterChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate-500 dark:text-slate-400">Type</span>
          <select
            name="type"
            value={filters.type}
            onChange={onFilterChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate-500 dark:text-slate-400">From</span>
          <DateInput
            name="startDate"
            value={filters.startDate}
            onChange={onFilterChange}
            containerClassName="mt-1"
            className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-500 dark:text-slate-400">To</span>
          <DateInput
            name="endDate"
            value={filters.endDate}
            onChange={onFilterChange}
            containerClassName="mt-1"
            className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
      </div>

      {loading && !completed.length && !scheduled.length ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Completed transactions</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {completedPagination.total} total
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <TransactionTable
                items={completed}
                loading={loading}
                emptyMessage="No completed transactions match your filters."
                onEdit={openEdit}
                onDelete={handleDelete}
                showStatus={false}
              />
            </div>
            {completedPagination.pages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Page {completedPagination.page} of {completedPagination.pages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={completedPagination.page <= 1}
                    onClick={() =>
                      setCompletedPagination((p) => ({ ...p, page: p.page - 1 }))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={completedPagination.page >= completedPagination.pages}
                    onClick={() =>
                      setCompletedPagination((p) => ({ ...p, page: p.page + 1 }))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-slate-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Scheduled transactions
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming — not included in balance or charts</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-violet-200 bg-white shadow-sm dark:border-violet-900/50 dark:bg-slate-900">
              <TransactionTable
                items={scheduled}
                loading={loading}
                emptyMessage="No scheduled transactions. Add one with a future date."
                onEdit={openEdit}
                onDelete={handleDelete}
                scheduledStyle
              />
            </div>
          </section>
        </>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {modal.editing ? "Edit transaction" : "New transaction"}
            </h2>
            <div className="mt-4">
              <TransactionForm
                categories={categories.length ? categories : ["Other"]}
                initial={modal.editing}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                submitting={submitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
