import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { Insights } from "./pages/Insights";
import { SessionSetup } from "./pages/SessionSetup";
import { FocusSession } from "./pages/FocusSession";
import { SessionSummary } from "./pages/SessionSummary";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { AuthProvider } from "./features/auth/AuthProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session/setup" element={<SessionSetup />} />
            <Route path="/session" element={<FocusSession />} />
            <Route path="/session/summary" element={<SessionSummary />} />
            <Route path="/history" element={<History />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
