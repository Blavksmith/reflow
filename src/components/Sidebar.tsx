import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  CalendarClock,
  Home,
  MessageSquare,
  Settings,
  Timer,
} from "lucide-react";
import { cn } from "../lib/utils";

const navigation = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Focus session", to: "/session/setup", icon: Timer },
  { label: "History", to: "/history", icon: CalendarClock },
  { label: "Insights", to: "/insights", icon: BarChart3 },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="sticky top-5 my-0 mb-5 ml-6 hidden h-[calc(100vh-112px)] self-start w-[72px] shrink-0 flex-col items-center rounded-2xl bg-white px-2 py-5 shadow-soft md:flex"
      aria-label="Workspace navigation"
    >
      <nav className="flex w-full flex-col items-center gap-3 bg-transparent px-2 py-5">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            title={label}
            className={({ isActive }) => {
              const focusIsActive =
                label === "Focus session" &&
                location.pathname.startsWith("/session");
              const active = isActive || focusIsActive;
              return cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors",
                active
                  ? "bg-sky-100 text-sky-500"
                  : "text-ink-800 hover:bg-sky-50 hover:text-sky-500",
              );
            }}
          >
            {({ isActive }) => (
              <>
                <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="pointer-events-none absolute left-full z-20 ml-3 whitespace-nowrap rounded-lg bg-ink-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-control transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        aria-label="Open support"
        className="mt-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white text-ink-800 transition-colors hover:bg-sky-100"
      >
        <MessageSquare size={19} />
      </button>
    </aside>
  );
}
