import { useEffect, useMemo, useState } from "react";
import { assignInventoryPart, createInventoryPart, getInventoryParts } from "../../api/inventory";
import "./InventoryManagement.css";

const APPLIANCE_TYPES = ["Refrigerator", "Washing machine", "Dishwasher", "Dryer", "Air conditioner", "Oven", "Microwave", "Other"];
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function InventoryManagement({ token, requests = [], onRequestsChanged }) {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [partSearch, setPartSearch] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const loadParts = async () => {
    setError("");
    try { const result = await getInventoryParts(token); setParts(Array.isArray(result) ? result : []); }
    catch (loadError) { setError(loadError.message || "Inventory could not be loaded."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadParts(); }, [token]);

  const waitingCalls = useMemo(() => requests.filter((request) => request.status === "AwaitingParts"), [requests]);
  const visibleParts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return parts.filter((part) => !term || [part.sku, part.name, part.applianceType, part.description].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [parts, search]);
  const matchingParts = useMemo(() => {
    const term = partSearch.trim().toLowerCase();
    return parts.filter((part) => part.quantityInStock > 0 && (!term || [part.sku, part.name, part.applianceType].some((value) => String(value || "").toLowerCase().includes(term))));
  }, [parts, partSearch]);
  const selectedPart = parts.find((part) => String(part.id) === String(selectedPartId));
  const selectedCall = requests.find((request) => String(request.id) === String(selectedRequestId));
  const lowStockCount = parts.filter((part) => part.quantityInStock <= 3).length;
  const totalUnits = parts.reduce((total, part) => total + Number(part.quantityInStock || 0), 0);

  const savePart = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(event.currentTarget);
    setSaving(true); setError(""); setNotice("");
    try {
      await createInventoryPart(token, {
        sku: String(data.get("sku") || "").trim(), name: String(data.get("name") || "").trim(),
        applianceType: String(data.get("applianceType") || ""), description: String(data.get("description") || "").trim(),
        quantityInStock: Number(data.get("quantityInStock") || 0), unitPrice: Number(data.get("unitPrice") || 0),
      });
      form.reset(); setShowAddForm(false); setNotice("Part added to inventory."); await loadParts();
    } catch (saveError) { setError(saveError.message || "The part could not be added."); }
    finally { setSaving(false); }
  };

  const assignPart = async (event) => {
    event.preventDefault();
    if (!selectedRequestId || !selectedPartId) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await assignInventoryPart(token, { serviceRequestId: Number(selectedRequestId), inventoryPartId: Number(selectedPartId), quantity: Number(quantity) });
      setNotice(result.message || "Part assigned to the service call."); setQuantity(1); await loadParts(); await onRequestsChanged?.();
    } catch (assignError) { setError(assignError.message || "The part could not be assigned."); }
    finally { setSaving(false); }
  };

  return <section className="inventory-page">
    <header className="inventory-hero"><div><span className="inventory-kicker">PARTS AND STOCK</span><h1>Inventory</h1><p>Keep appliance parts organized and get the right item to calls waiting for parts.</p></div><button type="button" className="inventory-primary" onClick={() => setShowAddForm((open) => !open)}>{showAddForm ? "Close form" : "+ Add a part"}</button></header>
    {error && <div className="inventory-message inventory-error" role="alert">{error}</div>}{notice && <div className="inventory-message inventory-success" role="status">{notice}</div>}
    <div className="inventory-metrics"><article><span>Parts in catalog</span><strong>{parts.length}</strong></article><article><span>Units in stock</span><strong>{totalUnits}</strong></article><article><span>Low stock items</span><strong>{lowStockCount}</strong></article><article><span>Calls awaiting parts</span><strong>{waitingCalls.length}</strong></article></div>

    {showAddForm && <section className="inventory-panel inventory-add-panel"><div className="inventory-panel-title"><div><h2>Add an inventory part</h2><p>Register a spare part and its available quantity.</p></div></div><form className="inventory-part-form" onSubmit={savePart}>
      <label>Part number / SKU *<input name="sku" required maxLength="40" placeholder="e.g. WASH-DP-003" /></label>
      <label>Part name *<input name="name" required maxLength="150" placeholder="e.g. Washer drain pump" /></label>
      <label>Appliance type *<select name="applianceType" required defaultValue=""><option value="" disabled>Select appliance</option>{APPLIANCE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Initial stock *<input name="quantityInStock" type="number" required min="0" max="1000000" step="1" defaultValue="0" /></label>
      <label>Unit cost ($)<input name="unitPrice" type="number" min="0" max="99999999.99" step="0.01" defaultValue="0" /></label>
      <label className="inventory-form-wide">Description<textarea name="description" maxLength="500" rows="2" placeholder="Fitment, model compatibility or supplier notes" /></label>
      <div className="inventory-form-actions"><button type="submit" className="inventory-primary" disabled={saving}>{saving ? "Saving…" : "Save part"}</button></div>
    </form></section>}

    <section className="inventory-panel inventory-assign-panel"><div className="inventory-panel-title"><div><h2>Assign a part to a waiting call</h2><p>Choose a call marked “Awaiting parts,” search the catalog, and reserve stock for that job.</p></div></div>
      {waitingCalls.length ? <form className="inventory-assignment-form" onSubmit={assignPart}>
        <label>Call waiting for parts<select required value={selectedRequestId} onChange={(event) => setSelectedRequestId(event.target.value)}><option value="">Choose service call</option>{waitingCalls.map((call) => <option key={call.id} value={call.id}>#{call.requestNumber} · {call.appliance} · {call.customerName}</option>)}</select></label>
        {selectedCall?.technicianNote && <p className="inventory-call-note"><b>Technician’s part request:</b> {selectedCall.technicianNote}</p>}
        <label>Search parts<input type="search" value={partSearch} onChange={(event) => setPartSearch(event.target.value)} placeholder="Search by part, SKU or appliance" /></label>
        {matchingParts.length ? <div className="inventory-part-results" role="radiogroup" aria-label="Available parts">{matchingParts.map((part) => <button type="button" role="radio" aria-checked={String(part.id) === String(selectedPartId)} className={`inventory-result-card${String(part.id) === String(selectedPartId) ? " selected" : ""}`} key={part.id} onClick={() => setSelectedPartId(String(part.id))}><span className="inventory-result-check">{String(part.id) === String(selectedPartId) ? "✓" : "＋"}</span><span><b>{part.name}</b><small>{part.applianceType} · {part.sku}</small></span><strong>{part.quantityInStock} available</strong></button>)}</div> : <p className="inventory-no-results">No matching parts in stock. Add the part or restock inventory before assigning.</p>}
        <div className="inventory-assign-actions"><label>Quantity<input type="number" min="1" max={selectedPart?.quantityInStock || 1} value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><span>{selectedPart ? `${selectedPart.name} · ${money(selectedPart.unitPrice)} each` : "Select a part above"}</span><button className="inventory-primary" type="submit" disabled={saving || !selectedPart || !selectedRequestId || Number(quantity) < 1 || Number(quantity) > (selectedPart?.quantityInStock || 0)}>{saving ? "Assigning…" : "Assign part"}</button></div>
      </form> : <div className="inventory-empty-call"><b>No calls are waiting for parts.</b><span>When a technician marks a call as “Awaiting parts,” it will appear here.</span></div>}
    </section>

    <section className="inventory-panel"><div className="inventory-panel-title inventory-list-title"><div><h2>Parts catalog</h2><p>Search by part name, SKU, or appliance type.</p></div><label className="inventory-search"><span>⌕</span><input aria-label="Search inventory" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inventory" /></label></div>
      <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>SKU</th><th>Part</th><th>Appliance</th><th>Description</th><th>In stock</th><th>Unit cost</th></tr></thead><tbody>{visibleParts.map((part) => <tr key={part.id}><td><b>{part.sku}</b></td><td>{part.name}</td><td>{part.applianceType}</td><td>{part.description || "—"}</td><td><span className={part.quantityInStock <= 3 ? "inventory-low-stock" : "inventory-stock"}>{part.quantityInStock} {part.quantityInStock <= 3 ? "· Low" : ""}</span></td><td>{money(part.unitPrice)}</td></tr>)}{!loading && visibleParts.length === 0 && <tr><td colSpan="6" className="inventory-table-empty">No parts found. Add a part or adjust your search.</td></tr>}{loading && <tr><td colSpan="6" className="inventory-table-empty">Loading parts catalog…</td></tr>}</tbody></table></div>
    </section>
    <section className="inventory-panel"><div className="inventory-panel-title"><div><h2>Parts reserved for waiting calls</h2><p>Reserved units have already been removed from available stock.</p></div></div><div className="inventory-reservation-list">{waitingCalls.flatMap((call) => (call.assignedParts || []).map((assigned) => ({ ...assigned, call }))).map((assigned) => <div className="inventory-reservation" key={assigned.id}><span><b>{assigned.name}</b><small>{assigned.applianceType} · {assigned.sku}</small></span><span>#{assigned.call.requestNumber} · {assigned.call.appliance}</span><b>× {assigned.quantity}</b></div>)}{waitingCalls.every((call) => !call.assignedParts?.length) && <p className="inventory-no-results">No parts have been reserved for calls yet.</p>}</div></section>
  </section>;
}
