import { logError, logInfo, logWarning } from './logger.js';
import {
  fetchMovieById,
  fetchMovieReviews,
  fetchMovies,
} from './movies/api.js';
import {
  renderMovieCards,
  renderMovieDetailContent,
  showStatusMessage,
} from './movies/ui.js';
import { refreshWatchlist } from './watchlist/manager.js';

// get content wrapper elements
const movieStatusElement = document.getElementById('movieStatus');
const movieGridElement = document.getElementById('movieGrid');
const movieDetailsModalElement = document.getElementById('movieDetailsModal');
const movieDetailsTitleElement = document.getElementById('movieDetailsTitle');
const movieDetailsBodyElement = document.getElementById('movieDetailsBody');

let movieDetailsModalInstance = null;
if (
  movieDetailsModalElement &&
  window.bootstrap &&
  typeof window.bootstrap.Modal === 'function'
) {
  movieDetailsModalInstance = new window.bootstrap.Modal(
    movieDetailsModalElement
  );
}

const watchlistNavLink = document.getElementById('watchlistNavLink');
if (watchlistNavLink) {
  watchlistNavLink.addEventListener('click', (event) => {
    event.preventDefault();
    document
      .getElementById('watchlist')
      ?.scrollIntoView({ behavior: 'smooth' });
    refreshWatchlist();
  });
}

document.addEventListener('movie:show-details', (event) => {
  const movieId = event.detail?.movieId;
  if (movieId) {
    openMovieDetails(movieId);
  }
});

document.addEventListener('watchlist:updated', () => {
  if (movieGridElement && currentMovies.length > 0) {
    renderMovieCards(movieGridElement, currentMovies);
  }
});

let currentMovies = [];

export async function loadMovieFeed() {
  if (!movieStatusElement || !movieGridElement) {
    logWarning('Movie feed placeholder(s) not found. Skipping load.');
    return;
  }

  showStatusMessage(movieStatusElement, 'Loading movies...', 'alert-secondary');
  movieGridElement.innerHTML = '';

  try {
    const payload = await fetchMovies();
    if (!payload || !Array.isArray(payload.data)) {
      throw new Error('Unexpected response shape.');
    }

    if (payload.data.length === 0) {
      showStatusMessage(
        movieStatusElement,
        'No movies found yet. Add some through the backend.',
        'alert-warning'
      );
      return;
    }

    movieStatusElement.classList.add('d-none');
    currentMovies = payload.data;
    renderMovieCards(movieGridElement, currentMovies);
    logInfo('Loaded', payload.data.length, 'movies');
  } catch (error) {
    logError('Failed to load movies', error);
    showStatusMessage(
      movieStatusElement,
      'Could not load movies. Please try again later.',
      'alert-danger'
    );
  }
}

async function openMovieDetails(movieId) {
  if (!movieDetailsModalInstance || !movieDetailsBodyElement) {
    logWarning('Movie details modal is not available in DOM.');
    return;
  }

  if (movieDetailsTitleElement) {
    movieDetailsTitleElement.textContent = 'Loading...';
  }
  movieDetailsBodyElement.innerHTML =
    '<p class="text-secondary mb-0">Fetching movie details...</p>';
  movieDetailsModalInstance.show();

  try {
    const movieResponse = await fetchMovieById(movieId);
    const reviewsResponse = await fetchMovieReviews(movieId);

    const movie =
      movieResponse && movieResponse.data ? movieResponse.data : null;
    const reviews =
      reviewsResponse && Array.isArray(reviewsResponse.data)
        ? reviewsResponse.data
        : [];

    if (!movie) {
      throw new Error('Movie not found');
    }

    renderMovieDetailContent(
      movieDetailsBodyElement,
      movieDetailsTitleElement,
      movie,
      reviews
    );
  } catch (error) {
    logError('Failed to load movie details', error);
    if (movieDetailsTitleElement) {
      movieDetailsTitleElement.textContent = 'Movie details';
    }
    movieDetailsBodyElement.innerHTML =
      '<div class="alert alert-danger mb-0">Something went wrong loading this movie.</div>';
  }
}
