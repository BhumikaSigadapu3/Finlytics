import { useCallback, useEffect, useMemo, useState } from "react";
import * as tx from "../services/transactionService.js";
import Spinner from "../components/Spinner.jsx";
import DateInput from "../components/DateInput.jsx";
import { CategoryPieChart, SpendingLineChart } from "../components/Charts.jsx";

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function StatCard({ title, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const range = useMemo(() => defaultRange(), []);
  const [startDate, setStartDate] = useState(range.start);
  const [endDate, setEndDate] = useState(range.end);
  const [summary, setSummary] = useState(null);
  const [pie, setPie] = useState([]);
  const [line, setLine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(
    () => ({ startDate, endDate }),
    [startDate, endDate]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, c, t] = await Promise.all([
        tx.fetchSummary(params),
        tx.fetchCategoryBreakdown(params),
        tx.fetchSpendingTrends(params),
      ]);
      setSummary(s);
      setPie(c.data || []);
      setLine(t.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const money = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Overview for the selected period (completed transactions only).
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="block text-slate-500 dark:text-slate-400">From</span>
            <DateInput
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="text-sm">
            <span className="block text-slate-500 dark:text-slate-400">To</span>
            <DateInput
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <button
            type="button"
            onClick={load}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {loading && !summary ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Total income" value={money(summary?.income)} accent="text-emerald-600 dark:text-emerald-400" />
            <StatCard title="Total expenses" value={money(summary?.expense)} accent="text-rose-600 dark:text-rose-400" />
            <StatCard title="Balance" value={money(summary?.balance)} accent="text-slate-900 dark:text-white" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Expenses by category
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pie chart for expenses in range.</p>
              <div className="mt-4">
                <CategoryPieChart data={pie} />
              </div>
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Spending over time</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Daily expense totals.</p>
              <div className="mt-4">
                <SpendingLineChart data={line} />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
