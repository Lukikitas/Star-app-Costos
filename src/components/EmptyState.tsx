export const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-600 dark:text-slate-300">
    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
    <p>{description}</p>
  </div>
);
