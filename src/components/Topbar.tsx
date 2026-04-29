import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const Topbar = () => {
  const { user, business } = useAuthContext();
  const { resolvedTheme, toggle } = useTheme();
  return (
    <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-3 py-3 md:p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">Negocio</p>
        <p className="font-semibold truncate">{business?.name ?? "Sin negocio"}</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          onClick={toggle}
          aria-label="Cambiar tema"
          title="Cambiar tema"
        >
          {resolvedTheme === "dark" ? "Oscuro" : "Claro"}
        </button>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate max-w-[45vw] sm:max-w-none">{user?.email}</p>
      </div>
    </header>
  );
};
