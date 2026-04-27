import { Outlet } from "react-router-dom";

export const AuthLayout = () => (
  <div className="min-h-screen grid place-items-center p-4 bg-slate-100 dark:bg-slate-950">
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-1">STAR Costos</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Gestioná costos y precios sugeridos.</p>
      <Outlet />
    </div>
  </div>
);
