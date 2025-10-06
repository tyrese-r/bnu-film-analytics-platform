// fetch helpers for watchlist endpoints
import { buildAuthHeaders } from '../auth/api.js';
import { API_BASE_URL } from '../config.js';

export async function fetchWatchlist() {
  return request('/saved-movies', { method: 'GET' });
}

export async function addToWatchlist(movieId) {
  return request('/saved-movies', {
    method: 'POST',
    body: JSON.stringify({ movie_id: movieId }),
  });
}

export async function removeFromWatchlist(savedMovieId) {
  return request(`/saved-movies/${savedMovieId}`, { method: 'DELETE' });
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
    throw new Error(message || 'Watchlist request failed');
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
