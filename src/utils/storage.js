const USER_KEY  = 'lex-rating-user';
const TOKEN_KEY = 'lex-rating-token';

export function getStoredUser() {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch { return null; }
}

export function storeUser(user) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
}

export function clearStoredUser() {
  try { localStorage.removeItem(USER_KEY); } catch {}
}

export function getToken()        { return localStorage.getItem(TOKEN_KEY) || null; }
export function storeToken(token) { try { localStorage.setItem(TOKEN_KEY, token); } catch {} }
export function clearToken()      { try { localStorage.removeItem(TOKEN_KEY); } catch {} }
