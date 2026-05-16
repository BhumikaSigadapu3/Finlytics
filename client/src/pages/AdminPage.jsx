import { useCallback, useEffect, useState } from "react";
import * as admin from "../services/adminService.js";
import Spinner from "../components/Spinner.jsx";

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, u] = await Promise.all([admin.fetchAdminStats(), admin.fetchUsers()]);
      setStats(s);
      setUsers(u.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (id, role) => {
    try {
      await admin.updateUserRole(id, role);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not update role");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Delete this user and all their transactions?")) return;
    try {
      await admin.deleteUser(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage users and roles.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Users" value={stats.userCount} />
          <Stat label="Transactions" value={stats.transactionCount} />
          <Stat label="Admins" value={stats.adminCount} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Role</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-sm">{u.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => removeUser(u.id)}
                    className="text-sm text-rose-600 hover:underline dark:text-rose-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
