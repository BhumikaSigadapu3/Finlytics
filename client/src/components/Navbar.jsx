import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const linkClass = ({ isActive }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-brand-600 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  ].join(" ");

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="text-lg font-semibold text-brand-700 dark:text-brand-400" end>
            Finlytics
          </NavLink>
          {user && (
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink to="/" className={linkClass} end>
                Dashboard
              </NavLink>
              <NavLink to="/transactions" className={linkClass}>
                Transactions
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={linkClass}>
                  Admin
                </NavLink>
              )}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {dark ? "Light" : "Dark"}
          </button>
          {user ? (
            <>
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
                {user.name}
                <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-xs capitalize dark:bg-slate-800">
                  {user.role}
                </span>
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Sign in
            </NavLink>
          )}
        </div>
      </div>
      {user && (
        <nav className="flex gap-1 border-t border-slate-100 px-4 py-2 sm:hidden dark:border-slate-800">
          <NavLink to="/" className={linkClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={linkClass}>
            Transactions
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
