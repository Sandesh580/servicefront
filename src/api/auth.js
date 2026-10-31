const API_BASE_URL = "/api/auth";

async function authRequest(endpoint, payload, label) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (cause) {
    throw new Error(
      "Cannot connect to the backend server. Please make sure the backend is running.",
      { cause },
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `${label} failed (${response.status})`);
  }
  return data;
}

export function loginUser(email, password) {
  return authRequest("login", { email, password }, "Login");
}

export function registerUser(name, phone, address, email, password, avatarKey) {
  return authRequest("register", { userName: name, phone, address, email, password, avatarKey }, "Registration");
}

async function roleRequest(path, token, options = {}) {
  let response;
  try {
    response = await fetch(path, {
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
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export function getAppliances(token) {
  return roleRequest("/api/customer/appliances", token);
}

export function getCustomerRequests(token) {
  return roleRequest("/api/customer/requests", token);
}

export function getCustomerProfile(token) {
  return roleRequest("/api/customer/profile", token);
}

export function updateCustomerProfile(token, payload) {
  return roleRequest("/api/customer/profile", token, { method: "PUT", body: JSON.stringify(payload) });
}

export function bookCustomerRequest(token, request) {
  return roleRequest("/api/customer/requests", token, { method: "POST", body: JSON.stringify(request) });
}

export function getTechnicianRequests(token) {
  return roleRequest("/api/technician/requests", token);
}

export function updateTechnicianRequest(token, id, action, reason, amountPaid, nextVisitDate) {
  return roleRequest(`/api/technician/requests/${id}/action`, token, {
    method: "PATCH",
    body: JSON.stringify({ action, reason, amountPaid, nextVisitDate }),
  });
}

export function getTechnicianNotifications(token) {
  return roleRequest("/api/technician/notifications", token);
}

export function markTechnicianNotificationRead(token, id) {
  return roleRequest(`/api/technician/notifications/${id}/read`, token, { method: "PATCH" });
}

export function markAllTechnicianNotificationsRead(token) {
  return roleRequest("/api/technician/notifications/read-all", token, { method: "PATCH" });
}
