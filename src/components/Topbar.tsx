import { useAuthContext } from "../context/AuthContext";

export const Topbar = () => {
  const { user, business } = useAuthContext();
  return (
    <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">Negocio</p>
        <p className="font-semibold">{business?.name ?? "Sin negocio"}</p>
      </div>
      <p className="text-sm text-slate-600">{user?.email}</p>
    </header>
  );
};
