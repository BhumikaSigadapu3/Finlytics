import StatusBadge from "./StatusBadge.jsx";

export default function TransactionTable({
  items,
  loading,
  emptyMessage,
  onEdit,
  onDelete,
  showStatus = true,
  scheduledStyle = false,
}) {
  const money = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);

  if (loading) {
    return <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading…</p>;
  }
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Description</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Category</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Type</th>
            {showStatus && (
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
            )}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Amount</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((row) => (
            <tr
              key={row.id}
              className={
                scheduledStyle
                  ? "bg-violet-50/50 hover:bg-violet-50 dark:bg-violet-950/20 dark:hover:bg-violet-950/30"
                  : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
              }
            >
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                {new Date(row.date).toLocaleDateString()}
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-sm">{row.description || "—"}</td>
              <td className="px-4 py-3 text-sm">{row.category}</td>
              <td className="px-4 py-3 text-sm capitalize">
                <span
                  className={
                    row.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }
                >
                  {row.type}
                </span>
              </td>
              {showStatus && (
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
              )}
              <td className="px-4 py-3 text-right text-sm font-medium tabular-nums">{money(row.amount)}</td>
              <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right text-sm">
                <button
                  type="button"
                  className="text-brand-600 hover:underline dark:text-brand-400"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-rose-600 hover:underline dark:text-rose-400"
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
