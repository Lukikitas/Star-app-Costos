import { NavLink } from "react-router-dom";

export const appLinks = [
  ["/dashboard", "Dashboard"],
  ["/supplies", "Insumos"],
  ["/recipes", "Recetas"],
  ["/compare", "Historial"],
  ["/settings", "Configuración"],
] as const;

export const Sidebar = () => (
  <aside className="hidden md:block w-64 bg-slate-900 text-white p-4">
    <h1 className="font-bold text-xl mb-6">STAR Costos</h1>
    <nav className="space-y-2">
      {appLinks.map(([to, label]) => (
        <NavLink key={to} to={to} className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? "bg-slate-700" : "hover:bg-slate-800"}`}>
          {label}
        </NavLink>
      ))}
    </nav>
  </aside>
);
