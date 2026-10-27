const API_BASE_URL = "/api/auth";

export async function loginUser(email, password) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    throw new Error(
      "Cannot connect to the backend server. Please make sure the backend is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Login failed (${response.status})`);
  }

  return data;
}

export async function registerUser(name, email, password) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: name,
        email: email,
        password: password,
      }),
    });
  } catch (err) {
    throw new Error(
      "Cannot connect to the backend server. Please make sure the backend is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Registration failed (${response.status})`);
  }

  return data;
}
