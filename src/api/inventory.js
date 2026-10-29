const API_BASE_URL = "/api/inventory";

async function inventoryRequest(path, token, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
    });
  } catch {
    throw new Error("Cannot connect to the inventory service. Check that the backend is running.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || `Inventory request failed (${response.status})`);
  return data;
}

export function getInventoryParts(token) {
  return inventoryRequest("/parts", token);
}

export function createInventoryPart(token, part) {
  return inventoryRequest("/parts", token, { method: "POST", body: JSON.stringify(part) });
}

export function assignInventoryPart(token, assignment) {
  return inventoryRequest("/assignments", token, { method: "POST", body: JSON.stringify(assignment) });
}
