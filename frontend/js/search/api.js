// search helpers for OMDb integration
import { API_BASE_URL } from '../config.js';

export async function searchMovies(query) {
  const params = new URLSearchParams({ query });
  const response = await fetch(
    `${API_BASE_URL}/movies/search/omdb?${params.toString()}`,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  if (!response.ok) {
    throw new Error('Search request failed: ' + response.status);
  }
  const body = await response.json().catch(() => null);
  return Array.isArray(body?.data) ? body.data : [];
}
