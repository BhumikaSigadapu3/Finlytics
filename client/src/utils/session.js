const TOKEN_KEY = "token";
const SSO_EXPIRES_KEY = "ssoExpiresAt";

export function saveSession(token, sso) {
  localStorage.setItem(TOKEN_KEY, token);
  if (sso?.expiresAt) {
    localStorage.setItem(SSO_EXPIRES_KEY, sso.expiresAt);
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SSO_EXPIRES_KEY);
}

export function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(SSO_EXPIRES_KEY);
  if (token && expiresAt && new Date(expiresAt) < new Date()) {
    clearSession();
    return null;
  }
  return token;
}

export function getSsoExpiresAt() {
  const v = localStorage.getItem(SSO_EXPIRES_KEY);
  return v ? new Date(v) : null;
}
