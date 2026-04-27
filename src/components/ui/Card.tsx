export const Card = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl ${className}`}>{children}</div>
);

export const CardHeader = ({ className = "", title, description }: { className?: string; title: string; description?: string }) => (
  <div className={`p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 ${className}`}>
    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
    {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
  </div>
);

export const CardBody = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-4 md:p-5 ${className}`}>{children}</div>
);

