export const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
    <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
    <p>{description}</p>
  </div>
);
