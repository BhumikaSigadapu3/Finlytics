import api from "./api.js";

export async function fetchAdminStats() {
  const { data } = await api.get("/admin/stats");
  return data;
}

export async function fetchUsers() {
  const { data } = await api.get("/admin/users");
  return data;
}

export async function updateUserRole(id, role) {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data;
}

export async function deleteUser(id) {
  await api.delete(`/admin/users/${id}`);
}
