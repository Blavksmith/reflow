import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppShell() {
  return (
    <div className="min-h-screen bg-page-gradient text-ink-950">
      <TopNav />
      <div className="flex min-h-[calc(100vh-92px)] items-stretch">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
