const API_BASE_URL = "/api/admin/technicians";

async function technicianRequest(path, token, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (cause) {
    throw new Error("Cannot connect to the service hub. Check that the backend is running.", { cause });
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new Error("The technician service is unavailable. Start the backend configured in vite.config.js (currently http://localhost:5012) and try again.");
    }
    throw new Error(data?.message || `Technician request failed (${response.status})`);
  }
  return data;
}

export function getTechnicians(token) {
  return technicianRequest("", token);
}

export function createTechnician(token, technician) {
  return technicianRequest("", token, {
    method: "POST",
    body: JSON.stringify(technician),
  });
}

export function updateTechnician(token, id, technician) {
  return technicianRequest(`/${encodeURIComponent(id)}`, token, {
    method: "PUT",
    body: JSON.stringify(technician),
  });
}

export function deleteTechnician(token, id) {
  return technicianRequest(`/${encodeURIComponent(id)}`, token, {
    method: "DELETE",
  });
}

