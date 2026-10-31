import { useEffect, useState } from "react";
import { deleteCustomer, getCustomers, updateCustomer } from "../../api/customers";
import { useLanguage } from "../../i18n";

const avatars = ["Maya", "Asha", "Arjun", "Sita", "Kiran", "Nima"];
const avatarKey = (n) => `avatar-${n + 1}`;
const avatarPath = (key) => `/avatars/${key || "avatar-1"}.png`;

export default function CustomersManagement({ token }) {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () => getCustomers(token).then(setCustomers).catch((e) => setError(e.message));
  useEffect(() => { refresh(); }, [token]);

  const save = async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      await updateCustomer(token, editing.id, { name: String(form.get("name")).trim(), address: String(form.get("address")).trim(), avatarKey: String(form.get("avatarKey")), password: String(form.get("password") || "") });
      setEditing(null); setNotice("Customer details updated."); await refresh();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const remove = async (customer) => {
    if (!window.confirm(`Delete ${customer.name}'s customer account? Existing service call history will be retained.`)) return;
    setBusy(true); setError("");
    try { await deleteCustomer(token, customer.id); setCustomers((rows) => rows.filter((row) => row.id !== customer.id)); setNotice("Customer account deleted; service history retained."); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return <section className="panel customers-panel">
    <div className="panel-heading"><div><p className="eyebrow">{t("CUSTOMER ACCOUNTS")}</p><h2>{t("Customers")}</h2><p>{t("Review registered customers and update their account details.")}</p></div><button className="button button-outline" type="button" onClick={refresh}>{t("Refresh")}</button></div>
    {error && <div className="dashboard-alert" role="alert">{error}</div>}{notice && <div className="dashboard-notice" role="status">{notice}</div>}
    <div className="customers-table-wrap"><table className="customers-table"><thead><tr><th>{t("Customer")}</th><th>{t("Contact number")}</th><th>{t("Email")}</th><th>{t("Address")}</th><th>{t("Account")}</th></tr></thead><tbody>
      {customers.map((customer) => <tr key={customer.id}><td><span className="customer-list-avatar"><img src={avatarPath(customer.avatarKey)} alt="" /></span><strong>{customer.name}</strong></td><td>{customer.phone || "—"}</td><td>{customer.email || "Not provided"}</td><td>{customer.address || "—"}</td><td><div className="customer-row-actions"><button className="button button-small button-outline" type="button" onClick={() => { setEditing(customer); setError(""); }}>{t("Edit")}</button><button className="button button-small customer-delete-button" disabled={busy} type="button" onClick={() => remove(customer)}>{t("Delete")}</button></div></td></tr>)}
      {!customers.length && <tr><td colSpan="5" className="customers-empty">{t("No registered customer accounts found.")}</td></tr>}
    </tbody></table></div>
    {editing && <div className="customer-edit-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><form className="customer-edit-dialog" onSubmit={save}>
      <div className="panel-heading"><div><p className="eyebrow">CUSTOMER DETAILS</p><h2>Edit {editing.name}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={() => setEditing(null)}>×</button></div>
      <label>Full name<input name="name" defaultValue={editing.name} maxLength="100" required /></label>
      <label>Contact number <small>Contact DHC to change</small><input value={editing.phone} readOnly /></label>
      <label>Email <small>Contact DHC to change</small><input value={editing.email || "Not provided"} readOnly /></label>
      <label>Address<textarea name="address" defaultValue={editing.address} maxLength="1000" required /></label>
      <fieldset className="avatar-picker"><legend>Profile avatar</legend><div className="avatar-options">{avatars.map((label, index) => <label key={label} className={`avatar-choice${editing.avatarKey === avatarKey(index) ? " selected" : ""}`}><input type="radio" name="avatarKey" value={avatarKey(index)} defaultChecked={editing.avatarKey === avatarKey(index)} /><span><img src={avatarPath(avatarKey(index))} alt="" /></span><small>{label}</small></label>)}</div></fieldset>
      <label>Set a new password <small>Leave blank to keep it unchanged</small><input type="password" name="password" minLength="8" maxLength="100" autoComplete="new-password" /></label>
      <p className="customer-contact-note">Customer contact and email are protected. For updates, contact DHC support.</p>
      <div className="customer-edit-actions"><button type="button" className="button button-outline" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></div>
    </form></div>}
  </section>;
}
