/** Date field with a visible calendar icon in light and dark mode. */
export default function DateInput({ containerClassName = "", className = "", ...props }) {
  return (
    <div className={`date-input-wrap relative ${containerClassName}`}>
      <input type="date" className={`date-input w-full ${className}`} {...props} />
      <svg
        className="date-input-icon pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-200"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}
