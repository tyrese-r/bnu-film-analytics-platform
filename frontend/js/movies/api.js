// wrapper around fetch for movie endpoints
import { buildAuthHeaders } from '../auth/api.js';
import { API_BASE_URL } from '../config.js';

export async function fetchMovies() {
  const response = await fetch(`${API_BASE_URL}/movies`);
  if (!response.ok) {
    throw new Error('Server returned status ' + response.status);
  }
  return response.json();
}

export async function fetchMovieById(movieId) {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}`);
  if (!response.ok) {
    throw new Error('Movie details request failed: ' + response.status);
  }
  return response.json();
}

export async function createMovieFromImdb(imdbId) {
  const response = await fetch(`${API_BASE_URL}/movies`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({ imdb_id: imdbId }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.message || errorBody?.error || response.statusText;
    throw new Error(message || 'Failed to create movie');
  }
  return response.json();
}

export async function fetchMovieReviews(movieId) {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/reviews`);
  if (!response.ok) {
    throw new Error('Movie reviews request failed: ' + response.status);
  }
  return response.json();
}
