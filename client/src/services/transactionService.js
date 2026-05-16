import api from "./api.js";

export async function fetchTransactions(params) {
  const { data } = await api.get("/transactions", { params });
  return data;
}

export async function fetchCategories() {
  const { data } = await api.get("/transactions/categories");
  return data;
}

export async function createTransaction(body) {
  const { data } = await api.post("/transactions", body);
  return data;
}

export async function updateTransaction(id, body) {
  const { data } = await api.put(`/transactions/${id}`, body);
  return data;
}

export async function deleteTransaction(id) {
  await api.delete(`/transactions/${id}`);
}

export async function fetchSummary(params) {
  const { data } = await api.get("/analytics/summary", { params });
  return data;
}

export async function fetchCategoryBreakdown(params) {
  const { data } = await api.get("/analytics/category-breakdown", { params });
  return data;
}

export async function fetchSpendingTrends(params) {
  const { data } = await api.get("/analytics/spending-trends", { params });
  return data;
}
