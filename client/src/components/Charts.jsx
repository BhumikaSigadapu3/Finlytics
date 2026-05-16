import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#06b6d4",
  "#64748b",
];

export function CategoryPieChart({ data }) {
  if (!data?.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        No expense data for this range.
      </p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ category, percent }) =>
            `${category} (${(percent * 100).toFixed(0)}%)`
          }
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, "Amount"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SpendingLineChart({ data }) {
  if (!data?.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        No spending trend data for this range.
      </p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, "Spent"]} />
        <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
