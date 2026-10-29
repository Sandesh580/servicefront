const ACTIVE_ACCOUNT_KEY = "homecare.activeAccountId";
const LEGACY_KEYS = ["token", "userName", "userId", "userRole"];
const ACTIVITY_THROTTLE_MS = 5_000;

export function authStorageKey(userId) {
  return `homecare.auth.${encodeURIComponent(String(userId))}`;
}

export function authActivityKey(userId) {
  return `homecare.activity.${encodeURIComponent(String(userId))}`;
}

export function getLastAuthActivity(userId) {
  const key = authActivityKey(userId);
  const stored = Number(localStorage.getItem(key));
  if (Number.isFinite(stored) && stored > 0) return stored;
  const now = Date.now();
  localStorage.setItem(key, String(now));
  return now;
}

export function touchAuthActivity(userId) {
  const key = authActivityKey(userId);
  const now = Date.now();
  const previous = Number(localStorage.getItem(key));
  if (!Number.isFinite(previous) || now - previous >= ACTIVITY_THROTTLE_MS)
    localStorage.setItem(key, String(now));
}

export function getAuthSession() {
  let userId = sessionStorage.getItem(ACTIVE_ACCOUNT_KEY);
  if (!userId) {
    // Migrate a tab that was already signed in before per-account sessions were added.
    const legacyUserId = sessionStorage.getItem("userId");
    const legacyToken = sessionStorage.getItem("token");
    if (!legacyUserId || !legacyToken) return null;
    userId = legacyUserId;
    localStorage.setItem(authStorageKey(userId), JSON.stringify({
      userId,
      token: legacyToken,
      userName: sessionStorage.getItem("userName") || "",
      userRole: sessionStorage.getItem("userRole") || "",
    }));
    sessionStorage.setItem(ACTIVE_ACCOUNT_KEY, userId);
    localStorage.setItem(authActivityKey(userId), String(Date.now()));
    LEGACY_KEYS.forEach((key) => sessionStorage.removeItem(key));
  }

  try {
    const stored = localStorage.getItem(authStorageKey(userId));
    if (!stored) return null;
    const session = JSON.parse(stored);
    if (!session?.token || String(session.userId) !== userId) return null;
    getLastAuthActivity(userId);
    return session;
  } catch {
    return null;
  }
}

export function saveAuthSession(session) {
  const userId = String(session.userId);
  localStorage.setItem(authStorageKey(userId), JSON.stringify({ ...session, userId }));
  sessionStorage.setItem(ACTIVE_ACCOUNT_KEY, userId);
  localStorage.setItem(authActivityKey(userId), String(Date.now()));
  LEGACY_KEYS.forEach((key) => sessionStorage.removeItem(key));
}

export function clearAuthSession() {
  const userId = sessionStorage.getItem(ACTIVE_ACCOUNT_KEY);
  if (userId) {
    localStorage.removeItem(authStorageKey(userId));
    localStorage.removeItem(authActivityKey(userId));
  }
  sessionStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  LEGACY_KEYS.forEach((key) => sessionStorage.removeItem(key));
}