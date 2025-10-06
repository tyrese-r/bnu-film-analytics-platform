// renders the watchlist using shared movie templates
import { renderMovieCard } from '../movies/templates.js';
import { getAuthUser } from '../auth/state.js';

export function renderWatchlist(gridElement, statusElement, savedMovies) {
  if (!gridElement || !statusElement) return;

  gridElement.innerHTML = '';

  if (!getAuthUser()) {
    showStatus(statusElement, 'Please sign in to view your watchlist.', 'alert-warning');
    return;
  }

  if (!Array.isArray(savedMovies) || savedMovies.length === 0) {
    showStatus(statusElement, 'Your watchlist is empty. Add a movie to get started.', 'alert-secondary');
    return;
  }

  statusElement.classList.add('d-none');

  savedMovies.forEach((savedMovie) => {
    const column = document.createElement('div');
    column.className = 'col';
    const movie = buildWatchlistMovieData(savedMovie);
    column.innerHTML = renderMovieCard(movie);
    const watchlistButton = column.querySelector('[data-watchlist-action]');
    if (watchlistButton) {
      watchlistButton.setAttribute('data-action', 'watchlist');
      watchlistButton.setAttribute('data-saved-movie-id', savedMovie.id);
      watchlistButton.setAttribute('data-watchlist-action', 'remove');
      watchlistButton.textContent = 'Remove from watchlist';
      watchlistButton.classList.remove('btn-outline-light');
      watchlistButton.classList.add('btn-outline-danger');
    }
    gridElement.appendChild(column);
  });
}

export function showStatus(element, message, alertClass) {
  if (!element) return;
  element.textContent = message;
  element.className = 'alert ' + alertClass;
  element.classList.remove('d-none');
}

function buildWatchlistMovieData(savedMovie) {
  const movie = savedMovie.movie || {};
  return {
    id: movie.id,
    title: movie.title || 'Untitled',
    poster_url: movie.poster_url,
    descriptionText: movie.description || 'No description yet.',
    detailsLine: buildDetailsLine(movie),
    badgeText: extractPrimaryRating(movie),
    runtimeText: movie.runtime ? 'Runtime: ' + movie.runtime : 'Runtime unknown',
    saved: true,
    saved_movie_id: savedMovie.id,
    imdb_id: movie.imdb_id,
    canSave: true,
  };
}

function buildDetailsLine(movie) {
  const parts = [];
  if (movie.release_date) parts.push(movie.release_date);
  if (movie.genre) parts.push(movie.genre);
  if (movie.director) parts.push('Dir. ' + movie.director);
  return parts.length > 0 ? parts.join(' • ') : 'Details unavailable.';
}

function extractPrimaryRating(movie) {
  if (!movie || !Array.isArray(movie.ratings) || movie.ratings.length === 0) {
    return null;
  }
  const rating = movie.ratings[0];
  const source = rating.source || 'Critic';
  const value = rating.value || 'N/A';
  return `${source}: ${value}`;
}
