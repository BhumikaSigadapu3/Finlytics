/** Build CSV string from transaction rows */
export function transactionsToCsv(rows) {
  const headers = ["id", "amount", "type", "category", "date", "status", "description"];
  const escape = (v) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.amount,
        r.type,
        r.category,
        new Date(r.date).toISOString(),
        r.status || "completed",
        r.description,
      ]
        .map(escape)
        .join(",")
    );
  }
  return lines.join("\n");
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
