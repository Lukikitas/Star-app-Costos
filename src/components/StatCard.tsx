export const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
  </div>
);
