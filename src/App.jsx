import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { authActivityKey, authStorageKey, clearAuthSession, getAuthSession, getLastAuthActivity, touchAuthActivity } from "./auth/session";
import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import CustomerPortal from "./components/customer/CustomerPortal";
import TechnicianWorkspace from "./components/technician/TechnicianWorkspace";
import MarketplaceHome from "./components/home/MarketplaceHome"

function landingPath() {
  const session = getAuthSession();
  if (!session) return "/";
  if (session.userRole === "Manager" || session.userRole === "Admin") return "/dashboard";
  if (session.userRole === "Technician") return "/technician";
  if (session.userRole === "Customer") return "/customer";
  return "/login";
}

function RootRoute() {
  const session = getAuthSession();
  return session ? <Navigate to={landingPath()} replace /> : <MarketplaceHome />;
}

function ProtectedRole({ roles, children }) {
  const session = getAuthSession();
  if (!session) return <Navigate to="/login" replace />;
  if (!roles.includes(session.userRole)) return <Navigate to={landingPath()} replace />;
  return children;
}

function AccountSessionSync() {
  const navigate = useNavigate();
  useEffect(() => {
    const idleLimitMs = 5 * 60 * 1000;
    const signOut = (reason) => {
      clearAuthSession();
      navigate("/login", { replace: true, state: { reason } });
    };
    const recordActivity = () => {
      const session = getAuthSession();
      if (!session) return;
      if (Date.now() - getLastAuthActivity(session.userId) >= idleLimitMs) {
        signOut("idle");
        return;
      }
      touchAuthActivity(session.userId);
    };
    const checkInactivity = () => {
      const session = getAuthSession();
      if (session && Date.now() - getLastAuthActivity(session.userId) >= idleLimitMs)
        signOut("idle");
    };
    const handleStorage = (event) => {
      const activeAccountId = sessionStorage.getItem("homecare.activeAccountId");
      if (activeAccountId && event.key === authStorageKey(activeAccountId) && event.newValue === null) {
        clearAuthSession();
        navigate("/login", { replace: true, state: { reason: "signed-out" } });
      }
      if (activeAccountId && event.key === authActivityKey(activeAccountId)) checkInactivity();
    };
    const activityEvents = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    window.addEventListener("storage", handleStorage);
    const timer = window.setInterval(checkInactivity, 1000);
    checkInactivity();
    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(timer);
    };
  }, [navigate]);
  return null;
}
function App() {
  return (
    <>
      <AccountSessionSync />
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRole roles={["Manager", "Admin"]}><Dashboard /></ProtectedRole>} />
        <Route path="/customer" element={<ProtectedRole roles={["Customer"]}><CustomerPortal /></ProtectedRole>} />
        <Route path="/technician" element={<ProtectedRole roles={["Technician"]}><TechnicianWorkspace /></ProtectedRole>} />
        <Route path="*" element={<Navigate to={landingPath()} replace />} />
      </Routes>
    </>
  );
}

export default App;
