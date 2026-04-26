export const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-2xl font-semibold text-slate-800">{value}</p>
  </div>
);
