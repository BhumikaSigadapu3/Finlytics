export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
        {children}
        {footer}
      </div>
    </div>
  );
}
