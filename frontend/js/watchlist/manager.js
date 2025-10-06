// coordinates watchlist state with API and UI updates
import { addToWatchlist, removeFromWatchlist, fetchWatchlist } from './api.js';
import { renderWatchlist, showStatus } from './ui.js';
import { getAuthToken } from '../auth/state.js';
import { fetchMovieById, createMovieFromImdb } from '../movies/api.js';
import { logInfo, logWarning, logError } from '../logger.js';

let savedMovies = [];
let savedMovieMap = new Map();
let savedMovieByImdb = new Map();

const watchlistGridElement = document.getElementById('watchlistGrid');
const watchlistStatusElement = document.getElementById('watchlistStatus');

export async function loadWatchlist() {
  if (!getAuthToken()) {
    logWarning('Tried to load watchlist without auth token');
    updateSavedMovies([]);
    renderWatchlist(watchlistGridElement, watchlistStatusElement, savedMovies);
    dispatchWatchlistUpdated();
    return;
  }
  try {
    logInfo('Loading watchlist from API');
    showStatus(
      watchlistStatusElement,
      'Loading your watchlist...',
      'alert-secondary'
    );
    const response = await fetchWatchlist();
    const baseItems = Array.isArray(response?.data) ? response.data : [];
    const enriched = await Promise.all(
      baseItems.map(async (item) => {
        try {
          const movieResponse = await fetchMovieById(item.movie_id);
          return { ...item, movie: movieResponse?.data || null };
        } catch (error) {
          return { ...item, movie: null };
        }
      })
    );
    updateSavedMovies(enriched);
    renderWatchlist(watchlistGridElement, watchlistStatusElement, savedMovies);
    bindWatchlistButtons();
    dispatchWatchlistUpdated();
  } catch (error) {
    showStatus(
      watchlistStatusElement,
      error.message || 'Failed to load watchlist.',
      'alert-danger'
    );
  }
}

export async function addMovieToWatchlist(movieId) {
  if (!getAuthToken()) {
    showStatus(
      watchlistStatusElement,
      'Please sign in to save movies to your watchlist.',
      'alert-warning'
    );
    logWarning('Prevented watchlist save because user is not authenticated');
    return;
  }
  try {
    logInfo('Attempting to save movie', movieId);
    const response = await addToWatchlist(movieId);
    const saved = response?.data;
    if (saved) {
      logInfo('Saved movie response received', saved.id);
      const movieResponse = await fetchMovieById(movieId);
      const enriched = {
        ...saved,
        movie: movieResponse?.data || null,
      };
      updateSavedMovies([enriched, ...savedMovies]);
      renderWatchlist(watchlistGridElement, watchlistStatusElement, savedMovies);
      bindWatchlistButtons();
      dispatchWatchlistUpdated();
      showTransientStatus('Added to your watchlist.', 'alert-success');
    } else {
      await loadWatchlist();
    }
  } catch (error) {
    logError('addMovieToWatchlist failed', error);
    showStatus(
      watchlistStatusElement,
      error.message || 'Could not add movie to watchlist.',
      'alert-danger'
    );
  }
}

export async function removeMovieFromWatchlist(savedMovieId) {
  try {
    await removeFromWatchlist(savedMovieId);
    await loadWatchlist();
  } catch (error) {
    showStatus(
      watchlistStatusElement,
      error.message || 'Could not remove movie from watchlist.',
      'alert-danger'
    );
  }
}

export async function removeMovieFromWatchlistByMovieId(movieId) {
  const record = savedMovieMap.get(movieId);
  if (!record) return;
  await removeMovieFromWatchlist(record.id);
}

export async function addMovieToWatchlistByImdb(imdbId) {
  if (!getAuthToken()) {
    showStatus(
      watchlistStatusElement,
      'Please sign in to save movies to your watchlist.',
      'alert-warning'
    );
    return;
  }
  try {
    const response = await createMovieFromImdb(imdbId);
    const movie = response?.data;
    if (movie?.id) {
      await addMovieToWatchlist(movie.id);
    } else {
      throw new Error('Could not create movie from OMDb.');
    }
  } catch (error) {
    showStatus(
      watchlistStatusElement,
      error.message || 'Could not add movie to watchlist.',
      'alert-danger'
    );
  }
}

export function isMovieSaved(movieId) {
  return savedMovieMap.has(movieId);
}

export function getSavedMovieId(movieId) {
  return savedMovieMap.get(movieId)?.id || null;
}

export function getSavedMovie(movieId) {
  return savedMovieMap.get(movieId) || null;
}

export function getSavedMovieByImdb(imdbId) {
  return savedMovieByImdb.get(imdbId) || null;
}

export function refreshWatchlist() {
  loadWatchlist();
}

function updateSavedMovies(list) {
  savedMovies = list;
  savedMovieMap = new Map();
  savedMovieByImdb = new Map();
  savedMovies.forEach((item) => {
    const movieId = item.movie?.id || item.movie_id;
    if (movieId) {
      savedMovieMap.set(movieId, item);
    }
    const imdbId = item.movie?.imdb_id;
    if (imdbId) {
      savedMovieByImdb.set(imdbId, item);
    }
  });
}

function dispatchWatchlistUpdated() {
  document.dispatchEvent(new CustomEvent('watchlist:updated'));
}

function bindWatchlistButtons() {
  if (!watchlistGridElement) return;
  const detailButtons = watchlistGridElement.querySelectorAll(
    '[data-action="detail"]'
  );
  detailButtons.forEach((button) => {
    button.onclick = () => {
      const movieId = button.getAttribute('data-movie-id');
      if (!movieId) return;
      document.dispatchEvent(
        new CustomEvent('movie:show-details', { detail: { movieId } })
      );
    };
  });

  const removeButtons = watchlistGridElement.querySelectorAll(
    '[data-action="watchlist"][data-watchlist-action="remove"]'
  );
  removeButtons.forEach((button) => {
    button.onclick = () => {
      const savedMovieId = button.getAttribute('data-saved-movie-id');
      const movieId = button.getAttribute('data-movie-id');
      if (savedMovieId) {
        removeMovieFromWatchlist(savedMovieId);
      } else if (movieId) {
        removeMovieFromWatchlistByMovieId(movieId);
      }
    };
  });
}

function showTransientStatus(message, alertClass) {
  showStatus(watchlistStatusElement, message, alertClass);
  setTimeout(() => {
    if (watchlistStatusElement) {
      watchlistStatusElement.classList.add('d-none');
    }
  }, 2000);
}
