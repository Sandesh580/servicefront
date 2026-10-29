import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth";
import { saveAuthSession } from "../../auth/session";
import { LanguageSwitch, useLanguage } from "../../i18n";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("customer");

  const finishLogin = (data) => {
    saveAuthSession({ token: data.token, userName: data.userName, userId: data.userId, userRole: data.role, avatarKey: data.avatarKey });
    navigate(data.role === "Manager" || data.role === "Admin" ? "/dashboard" : data.role === "Technician" ? "/technician" : "/customer", { replace: true });
  };

  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    const values = new FormData(event.currentTarget);
    try { finishLogin(await loginUser(values.get("loginId"), values.get("password"))); }
    catch (requestError) { setError(requestError.message || "We couldn't sign you in."); }
    finally { setLoading(false); }
  };

  return <div className="login-container">
    <LanguageSwitch language={language} setLanguage={setLanguage} />
    <img className="auth-brand-logo" src="/dhc-logo.png" alt="DHC HomeCare Service Hub, Damak" />
    <span className="auth-eyebrow">HOME APPLIANCE SERVICE · DAMAK</span>
    <h1>{mode === "customer" ? t("Customer sign in") : "Team sign in"}</h1>
    <p>{mode === "customer" ? "Sign in using your contact number or email and password." : "Sign in with your staff email or Technician ID."}</p>
    {location.state?.reason === "idle" && <div className="auth-info-message" role="status">You were signed out after 5 minutes of inactivity.</div>}
    {location.state?.reason === "signed-out" && <div className="auth-info-message" role="status">You were signed out of this account in another tab.</div>}
    {error && <div className="auth-error-message" role="alert">{error}</div>}
    <div className="auth-mode-switch" role="group" aria-label="Choose sign-in type"><button type="button" className={mode === "customer" ? "selected" : ""} onClick={() => { setMode("customer"); setError(""); }}>Customer</button><button type="button" className={mode === "staff" ? "selected" : ""} onClick={() => { setMode("staff"); setError(""); }}>Manager / technician</button></div>
    <form onSubmit={submit}>
      <label>{mode === "customer" ? "Contact number or email" : "Email address or Technician ID"}<input type="text" name="loginId" placeholder={mode === "customer" ? "10-digit phone or email" : "Email address or Technician ID"} autoComplete="username" maxLength={256} required /></label>
      <label>{t("Password")}<input type="password" name="password" placeholder="Your password" autoComplete="current-password" required /></label>
      {mode === "customer" && <small>For email or password changes, please call DHC support.</small>}
      <button type="submit" disabled={loading}>{loading ? "Please wait…" : t("Sign in")}</button>
    </form>
    <p className="signup-link">New to DHC? <Link to="/signup">{t("Create customer account")}</Link></p>
  </div>;
}

export default Login;
