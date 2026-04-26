import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const AppLayout = () => (
  <div className="min-h-screen md:flex">
    <Sidebar />
    <main className="flex-1">
      <Topbar />
      <div className="p-4 md:p-6">
        <Outlet />
      </div>
    </main>
  </div>
);
