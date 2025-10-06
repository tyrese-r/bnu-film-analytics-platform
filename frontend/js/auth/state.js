// handles storing and retrieving auth session info
import { logInfo, logWarning } from '../logger.js';

const STORAGE_KEY = 'bnu-film-auth';

let authToken = null;
let authUser = null;

restoreSession();

export function getAuthToken() {
  return authToken;
}

export function getAuthUser() {
  return authUser;
}

export function saveSession(token, user) {
  authToken = token;
  authUser = user;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: authToken, user: authUser })
    );
    logInfo('Saved auth session for', user?.email || 'unknown user');
  } catch (error) {
    logWarning('Failed to save auth session to storage', error);
  }
}

export function clearSession() {
  authToken = null;
  authUser = null;
  localStorage.removeItem(STORAGE_KEY);
}

function restoreSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.user) {
      authToken = parsed.token;
      authUser = parsed.user;
      logInfo('Auth session restored for', authUser.email || 'unknown');
    }
  } catch (error) {
    logWarning('Failed to restore auth session from storage', error);
    localStorage.removeItem(STORAGE_KEY);
  }
}
