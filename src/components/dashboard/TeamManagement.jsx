import { useEffect, useMemo, useState } from "react";
import {
  createTechnician,
  deleteTechnician,
  getTechnicians,
  updateTechnician,
} from "../../api/technicians";
import "./TeamManagement.css";

function initials(name = "") {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "T";
}

function getTechnicianList(response) {
  const list = Array.isArray(response)
    ? response
    : response?.technicians ?? response?.items ?? response?.data;
  if (!Array.isArray(list)) {
    throw new Error("The technician list response was not in the expected format.");
  }
  return list;
}

function TeamManagement({ token }) {
  const [technicians, setTechnicians] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const refreshTechnicians = async () => {
    setError("");
    try {
      setTechnicians(getTechnicianList(await getTechnicians(token)));
    } catch (requestError) {
      setError(requestError.message || "Technicians could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    getTechnicians(token)
      .then((response) => {
        if (!cancelled) setTechnicians(getTechnicianList(response));
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message || "Technicians could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  const visibleTechnicians = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return technicians;
    return technicians.filter((technician) => [
      technician.name,
      technician.specialties,
      technician.phone,
      technician.educationQualification,
      technician.vocationalTraining,
      technician.permanentAddress,
      technician.currentAddress,
      technician.bloodGroup,
      technician.pastExperience,
    ].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [technicians, search]);

  const openCreateForm = () => {
    setEditingTechnician(null);
    setShowForm(true);
  };

  const openEditForm = (technician) => {
    setEditingTechnician(technician);
    setShowForm(true);
  };

  const closeForm = () => {
    if (!saving) {
      setShowForm(false);
      setEditingTechnician(null);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      specialties: String(formData.get("specialties") || "").trim(),
      educationQualification: String(formData.get("educationQualification") || "").trim(),
      vocationalTraining: String(formData.get("vocationalTraining") || "").trim(),
      permanentAddress: String(formData.get("permanentAddress") || "").trim(),
      currentAddress: String(formData.get("currentAddress") || "").trim(),
      bloodGroup: String(formData.get("bloodGroup") || "").trim(),
      pastExperience: String(formData.get("pastExperience") || "").trim(),
    };
    const password = String(formData.get("password") || "");
    if (!editingTechnician || password) payload.password = password;

    setSaving(true);
    setError("");
    try {
      if (editingTechnician) {
        const id = editingTechnician.id ?? editingTechnician.technicianId;
        if (id == null) throw new Error("This technician record has no ID and cannot be updated.");
        await updateTechnician(token, id, payload);
        setNotice("Technician details updated.");
      } else {
        await createTechnician(token, payload);
        setNotice("Technician added to your team.");
      }
      setShowForm(false);
      setEditingTechnician(null);
      await refreshTechnicians();
    } catch (requestError) {
      setError(requestError.message || "The technician could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (technician) => {
    const name = technician.name || "this technician";
    if (!window.confirm(`Permanently delete ${name}? This action cannot be undone.`)) return;
    const id = technician.id ?? technician.technicianId;
    if (id == null) {
      setError("This technician record has no ID and cannot be deleted.");
      return;
    }

    setDeletingId(id);
    setError("");
    try {
      await deleteTechnician(token, id);
      setTechnicians((current) => current.filter((item) => (item.id ?? item.technicianId) !== id));
      setNotice(`${name} was deleted.`);
    } catch (requestError) {
      setError(requestError.message || "The technician could not be deleted.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="team-page" id="team-management">
      <header className="team-hero">
        <div className="team-hero-copy">
          <span className="team-kicker">YOUR PEOPLE, IN ONE PLACE</span>
          <h1>Meet the team</h1>
          <p>Manage your technicians and keep your service team connected.</p>
        </div>
        <div className="team-hero-art" aria-hidden="true">
          <span className="team-art-orbit orbit-one" />
          <span className="team-art-orbit orbit-two" />
          <span className="team-art-person person-one">J</span>
          <span className="team-art-person person-two">A</span>
          <span className="team-art-person person-three">M</span>
        </div>
      </header>

      {error && <div className="team-alert" role="alert">{error}</div>}
      {notice && <div className="team-notice" role="status">{notice}</div>}

      <div className="team-toolbar">
        <div className="team-count">
          <strong>{technicians.length}</strong>
          <span>{technicians.length === 1 ? "technician" : "technicians"} on your team</span>
        </div>
        <div className="team-actions">
          <label className="team-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search technicians"
              placeholder="Search by name, specialty or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button type="button" className="team-add-button" onClick={openCreateForm}>＋ Add technician</button>
        </div>
      </div>

      {loading ? (
        <div className="team-empty">Loading your technicians…</div>
      ) : visibleTechnicians.length ? (
        <div className="technician-list-wrap">
          <div className="technician-list technician-list-heading" aria-hidden="true"><span>Technician ID</span><span>Name</span><span>Specialist in</span><span>Phone number</span><span>Actions</span></div>
          <div className="technician-list-body">
            {visibleTechnicians.map((technician, index) => {
              const id = technician.id ?? technician.technicianId ?? `technician-${index}`;
              return <article className="technician-list technician-list-row" key={id}>
                <strong className="technician-id">TECH-{id}</strong>
                <div className="technician-name"><span className={`technician-avatar avatar-${index % 5}`}>{initials(technician.name)}</span><strong>{technician.name || "Unnamed technician"}</strong></div>
                <span className="technician-specialties">{technician.specialties || "General appliance service"}</span>
                <a className="technician-phone" href={technician.phone ? `tel:${technician.phone}` : undefined}>{technician.phone || "No phone provided"}</a>
                <div className="technician-row-actions"><button type="button" className="technician-edit" onClick={() => openEditForm(technician)}>Edit</button><button type="button" className="technician-delete" disabled={deletingId === id} onClick={() => handleDelete(technician)}>{deletingId === id ? "Deleting…" : "Delete"}</button></div>
              </article>;
            })}
          </div>
        </div>      ) : (
        <div className="team-empty">
          <span className="team-empty-icon" aria-hidden="true">＋</span>
          <h2>{search ? "No teammates found" : "Your team starts here"}</h2>
          <p>{search ? "Try another search, or clear the search field." : "Add a technician to make it easy to assign and manage service work."}</p>
          {!search && <button type="button" className="team-add-button" onClick={openCreateForm}>Add your first technician</button>}
        </div>
      )}

      {showForm && (
        <div className="team-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm();
        }}>
          <section className="team-modal" role="dialog" aria-modal="true" aria-labelledby="technician-form-title">
            <div className="team-modal-heading">
              <div>
                <span className="team-kicker">{editingTechnician ? "TEAM PROFILE" : "GROW YOUR TEAM"}</span>
                <h2 id="technician-form-title">{editingTechnician ? "Edit technician" : "Add a technician"}</h2>
                <p>{editingTechnician ? "Update this teammate’s contact details." : "Add a teammate to your service operations."}</p>
              </div>
              <button type="button" className="team-modal-close" aria-label="Close" onClick={closeForm}>×</button>
            </div>
            <form className="technician-form" onSubmit={handleSave}>
              <div className="technician-form-grid">
              <label>Full name <span className="required-marker">Required</span><input name="name" required maxLength="100" defaultValue={editingTechnician?.name || ""} placeholder="e.g. Jordan Smith" /></label>
              <label>Email address for account recovery<input name="email" type="email" required maxLength="254" defaultValue={editingTechnician?.email || ""} placeholder="jordan@example.com" /><small>Technicians can sign in with their Technician ID instead.</small></label>
              <label>Specialist in <span className="required-marker">Required</span><input name="specialties" required maxLength="300" defaultValue={editingTechnician?.specialties || ""} placeholder="e.g. Air conditioning, washing machines" /></label>
              <label>Phone number <span className="required-marker">Required</span><input name="phone" type="tel" required maxLength="30" defaultValue={editingTechnician?.phone || ""} placeholder="+1 555 123 4567" /></label>
              <label>Current address <span className="required-marker">Required</span><textarea name="currentAddress" required maxLength="1000" defaultValue={editingTechnician?.currentAddress || ""} placeholder="Street, city, region and postal code" /></label>
              <label>Permanent address<textarea name="permanentAddress" maxLength="1000" defaultValue={editingTechnician?.permanentAddress || ""} placeholder="Leave blank if same as current address" /></label>
              <label>Education qualification<input name="educationQualification" maxLength="200" defaultValue={editingTechnician?.educationQualification || ""} placeholder="e.g. High school, diploma, degree" /></label>
              <label>Vocational or training courses<input name="vocationalTraining" maxLength="500" defaultValue={editingTechnician?.vocationalTraining || ""} placeholder="Course, institute or certification" /></label>
              <label>Blood group<select name="bloodGroup" defaultValue={editingTechnician?.bloodGroup || ""}><option value="">Select blood group (optional)</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((group) => <option key={group}>{group}</option>)}</select></label>
              <label className="technician-form-wide">Past experience<textarea name="pastExperience" maxLength="2000" defaultValue={editingTechnician?.pastExperience || ""} placeholder="Previous roles, years of experience and relevant appliance work" /></label>
              </div>
              <label>
                {editingTechnician ? "New password (optional)" : "Temporary password"}
                <input
                  name="password"
                  type="password"
                  required={!editingTechnician}
                  minLength="8"
                  autoComplete={editingTechnician ? "new-password" : "new-password"}
                  placeholder={editingTechnician ? "Leave blank to keep current password" : "At least 8 characters"}
                />
              </label>
              <div className="technician-form-actions">
                <button type="button" className="team-cancel-button" onClick={closeForm} disabled={saving}>Cancel</button>
                <button type="submit" className="team-add-button" disabled={saving}>{saving ? "Saving…" : editingTechnician ? "Save changes" : "Add technician"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default TeamManagement;
