import { Bell, Moon, Sun } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { useProfile } from "../features/profile/ProfileProvider";
import { useUserSettings } from "../features/settings/UserSettingsProvider";
import { useTheme } from "../theme/ThemeProvider";
import { ReflowCharacter } from "./ReflowCharacter";

const links = [
  { label: "Home", to: "/dashboard" },
  { label: "Focus Session", to: "/session/setup" },
  { label: "History", to: "/history" },
  { label: "Insights", to: "/insights" },
  { label: "Settings", to: "/settings" },
];

export function TopNav({ onLogin }: { onLogin: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { updateSetting, loading: settingsLoading } = useUserSettings();
  const { resolvedTheme, toggleTheme } = useTheme();
  const ThemeIcon = resolvedTheme === "dark" ? Sun : Moon;
  const nextThemeLabel = resolvedTheme === "dark" ? "light" : "dark";
  const displayName = profile?.display_name?.trim() || "Reflow user";
  const profileInitial = displayName.charAt(0).toUpperCase() || "R";
  const avatarUrl = profile?.avatar_url?.trim() || null;

  function handleThemeToggle() {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    toggleTheme();
    if (user && !settingsLoading) {
      void updateSetting("theme", nextTheme);
    }
  }

  function handleSignOut() {
    navigate("/dashboard", { replace: true });
    void signOut();
  }

  return (
    <header className="flex h-[92px] items-center justify-between gap-8 px-6 lg:px-10">
      <NavLink
        to="/dashboard"
        className="flex shrink-0 items-center gap-3"
        aria-label="Reflow home"
      >
        <ReflowCharacter size="small" variant="logo" />
        <span className="text-[24px] font-bold tracking-[-0.055em] text-ink-950">
          Reflow
        </span>
      </NavLink>
      <nav
        className="hidden items-center gap-2 xl:flex"
        aria-label="Main navigation"
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => {
              const focusIsActive =
                link.label === "Focus Session" &&
                location.pathname.startsWith("/session");
              const active = isActive || focusIsActive;
              return `rounded-full border px-5 py-3 text-[14px] font-medium transition-colors ${active ? "border-navy-900 bg-navy-900 text-white shadow-control" : "border-slate-200/70 bg-white/50 text-ink-800 hover:border-sky-200 hover:bg-sky-100"}`;
            }}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Switch to ${nextThemeLabel} mode`}
          aria-pressed={resolvedTheme === "dark"}
          onClick={handleThemeToggle}
          title={`Switch to ${nextThemeLabel} mode`}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/70 bg-white/70 text-ink-800 transition-colors hover:bg-sky-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
        >
          <ThemeIcon size={21} />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/70 bg-white/70 text-ink-800 transition-colors hover:bg-sky-100"
        >
          <Bell size={20} />
          <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-danger" />
        </button>
        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            title={`Sign out ${displayName}`}
            aria-label={`Sign out ${displayName}`}
            className="hidden h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#d7e7f6] text-sm font-bold text-navy-900 transition-colors hover:bg-sky-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200 sm:flex"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
              />
            ) : (
              profileInitial
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="inline-flex h-11 items-center justify-center rounded-full border border-sky-200 bg-white/80 px-4 text-[13px] font-semibold text-sky-500 shadow-soft transition-colors hover:bg-sky-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
          >
            Log in
          </button>
        )}
      </div>
    </header>
  );
}
