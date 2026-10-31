async function customerRequest(path, token, options = {}) {
  let response;
  try {
    response = await fetch(`/api/customers${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers } });
  } catch { throw new Error("Cannot connect to the service hub. Check that the backend is running."); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Customer request failed (${response.status})`);
  return data;
}
export const getCustomers = (token) => customerRequest("", token);
export const updateCustomer = (token, id, values) => customerRequest(`/${id}`, token, { method: "PUT", body: JSON.stringify(values) });
export const deleteCustomer = (token, id) => customerRequest(`/${id}`, token, { method: "DELETE" });
