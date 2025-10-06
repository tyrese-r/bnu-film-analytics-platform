import { API_BASE_URL } from '../config.js';
import { getAuthToken } from './state.js';

export async function signup(credentials) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function login(credentials) {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function logout() {
  return request('/users/logout', { method: 'POST' });
}

export async function fetchCurrentUser() {
  return request('/users/me', { method: 'GET' });
}

export function buildAuthHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
}

async function request(path, options = {}) {
  const headers = buildAuthHeaders();
  const response = await fetch(API_BASE_URL + path, {
    headers,
    ...options,
  });
  if (!response.ok) {
    const errorBody = await safeJson(response);
    const message =
      errorBody?.message || errorBody?.error || response.statusText;
    throw new Error(message || 'Auth request failed');
  }
  return safeJson(response);
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}
