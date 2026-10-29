import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";
import { saveAuthSession } from "../../auth/session";
import { LanguageSwitch, useLanguage } from "../../i18n";
import "./Signup.css";

const avatars = [
  { key: "avatar-1", image: "/avatars/avatar-1.png", label: "Maya" }, { key: "avatar-2", image: "/avatars/avatar-2.png", label: "Asha" },
  { key: "avatar-3", image: "/avatars/avatar-3.png", label: "Arjun" }, { key: "avatar-4", image: "/avatars/avatar-4.png", label: "Sita" },
  { key: "avatar-5", image: "/avatars/avatar-5.png", label: "Kiran" }, { key: "avatar-6", image: "/avatars/avatar-6.png", label: "Nima" },
];

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarKey, setAvatarKey] = useState("avatar-1");

  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") || "").replace(/\D/g, "");
    if (!/^\d{10}$/.test(phone)) { setError("Enter a valid 10-digit contact number."); setLoading(false); return; }
    try {
      const address = String(form.get("address") || "").trim();
      if (address.length < 8) { setError("Enter your current address (at least 8 characters)."); setLoading(false); return; }
      const data = await registerUser(String(form.get("name") || "").trim(), phone, address, String(form.get("email") || "").trim(), form.get("password"), avatarKey);
      saveAuthSession({ token: data.token, userName: data.userName, userId: data.userId, userRole: data.role, avatarKey: data.avatarKey || avatarKey });
      navigate("/customer", { replace: true, state: { selectedAppliance: location.state?.applianceName || "" } });
    } catch (requestError) { setError(requestError.message || "Your account could not be created."); }
    finally { setLoading(false); }
  };

  return <div className="signup-container">
    <LanguageSwitch language={language} setLanguage={setLanguage} />
    <img className="auth-brand-logo" src="/dhc-logo.png" alt="DHC HomeCare Service Hub, Damak" />
    <span className="auth-eyebrow">HOMECARE SERVICE HUB</span>
    <h1>{t("Create customer account")}</h1>
    <p>Book appliance service and follow every request from one place.</p>
    {location.state?.applianceName && <div className="auth-info-message" role="status">Create your account to book service for your {location.state.applianceName.toLowerCase()}.</div>}
    {error && <div className="auth-error-message" role="alert">{error}</div>}
    <form onSubmit={submit}>
      <label>{t("Full name")}<input type="text" name="name" placeholder="Your full name" autoComplete="name" maxLength={100} required /></label>
      <label>{t("Contact number")}<input type="tel" name="phone" placeholder="98XXXXXXXX" autoComplete="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required /><small>Enter your 10-digit mobile number.</small></label>
      <label>{t("Address")}<textarea name="address" placeholder="House, street, ward and city" autoComplete="street-address" minLength={8} maxLength={1000} rows={3} required /></label>
      <label>{t("Email address")} <small>Optional</small><input type="email" name="email" placeholder="you@example.com" autoComplete="email" maxLength={256} /></label>
      <label>{t("Password")}<input type="password" name="password" placeholder="At least 8 characters" autoComplete="new-password" minLength={8} maxLength={100} required /></label>
      <fieldset className="avatar-picker"><legend>{t("Choose your profile avatar")}</legend><div className="avatar-options">{avatars.map((avatar) => <button key={avatar.key} type="button" className={`avatar-choice${avatarKey === avatar.key ? " selected" : ""}`} aria-pressed={avatarKey === avatar.key} aria-label={`${avatar.label} avatar`} onClick={() => setAvatarKey(avatar.key)}><span><img src={avatar.image} alt="" /></span><small>{avatar.label}</small></button>)}</div></fieldset>
      <button type="submit" disabled={loading}>{loading ? "Please wait…" : "Create account"}</button>
    </form>
    <p className="login-link">Already have an account? <Link to="/login">Log in</Link></p>
    <small>Technician and manager access is issued by your service team.</small>
  </div>;
}

export default Signup;
