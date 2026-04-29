import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useIsMobileDevice } from "../hooks/useIsMobileDevice";
import { appLinks, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const AppLayout = () => {
  const isMobileDevice = useIsMobileDevice();

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1">
        <Topbar />
        <div className={`p-3 md:p-6 ${isMobileDevice ? "pb-24" : ""}`}>
          <Outlet />
        </div>
        {isMobileDevice && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-5 gap-1 px-2 py-2">
              {appLinks.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-lg px-1 py-2 text-center text-xs font-medium transition ${
                      isActive
                        ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </main>
    </div>
  );
};
