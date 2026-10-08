import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthModal } from "../features/auth/AuthModal";
import { useAuth } from "../features/auth/AuthProvider";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

type AuthRedirectState = {
  authRequired?: boolean;
  from?: string;
};

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const previousUserRef = useRef(user);
  const authCompletedRef = useRef(false);
  const locationState = location.state as AuthRedirectState | null;

  useEffect(() => {
    if (authLoading || user || !locationState?.authRequired || !locationState.from) {
      return;
    }

    queueMicrotask(() => {
      setPendingPath(locationState.from!);
      setIsAuthModalOpen(true);
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [authLoading, location.pathname, locationState, navigate, user]);

  useEffect(() => {
    if (authLoading || !user || !pendingPath) {
      return;
    }

    const destination = pendingPath;
    queueMicrotask(() => setPendingPath(null));
    navigate(destination, { replace: true, state: null });
  }, [authLoading, navigate, pendingPath, user]);

  useEffect(() => {
    const wasAuthenticated = Boolean(previousUserRef.current);
    previousUserRef.current = user;

    if (!authLoading && !user && wasAuthenticated && location.pathname !== "/dashboard") {
      queueMicrotask(() => {
        setPendingPath(null);
        setIsAuthModalOpen(false);
      });
      navigate("/dashboard", { replace: true, state: null });
    }
  }, [authLoading, location.pathname, navigate, user]);

  function openAuthModal() {
    setPendingPath(null);
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    if (authCompletedRef.current) {
      authCompletedRef.current = false;
      setIsAuthModalOpen(false);
      return;
    }

    setPendingPath(null);
    setIsAuthModalOpen(false);
  }

  function handleAuthenticated() {
    authCompletedRef.current = true;
    setIsAuthModalOpen(false);
  }

  if (authLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-page-gradient px-6 text-ink-600"
        role="status"
        aria-live="polite"
      >
        Restoring your Reflow session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-gradient text-ink-950">
      <TopNav onLogin={openAuthModal} />
      <div className="flex min-h-[calc(100vh-92px)] items-stretch">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}
