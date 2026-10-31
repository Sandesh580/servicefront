const API_BASE_URL = "/api/dashboard";

async function dashboardRequest(path, token, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Cannot connect to the service hub. Check that the backend is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Dashboard request failed (${response.status})`);
  }
  return data;
}

export function getDashboardStats(token) {
  return dashboardRequest("/stats", token);
}

export function getServiceRequests(token, search = "") {
  const query = new URLSearchParams();
  if (search.trim()) query.set("search", search.trim());
  const suffix = query.size ? `?${query.toString()}` : "";
  return dashboardRequest(`/requests${suffix}`, token);
}

export function createServiceRequest(token, request) {
  return dashboardRequest("/requests", token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateServiceRequestStatus(token, id, status, managerNote = "") {
  return dashboardRequest(`/requests/${id}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status, managerNote }),
  });
}

export function updateServiceRequestAssignment(token, id, changes) {
  return dashboardRequest(`/requests/${id}/assignment`, token, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}
