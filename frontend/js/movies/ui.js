// helpers
import { getAuthToken } from '../auth/state.js';
import {
  addMovieToWatchlist,
  addMovieToWatchlistByImdb,
  getSavedMovie,
  getSavedMovieByImdb,
  removeMovieFromWatchlist,
  removeMovieFromWatchlistByMovieId,
} from '../watchlist/manager.js';
import { renderMovieCard, renderMovieDetails } from './templates.js';

export function renderMovieCards(container, movies) {
  container.innerHTML = '';
  movies.forEach((movie) => {
    const column = document.createElement('div');
    column.className = 'col';
    column.innerHTML = renderMovieCard(buildMovieCardData(movie));
    enhanceMovieCard(column);
    container.appendChild(column);
  });
}

export function renderMovieDetailContent(
  bodyElement,
  titleElement,
  movie,
  reviews
) {
  const modalData = buildMovieDetailsData(movie, reviews);
  if (titleElement) {
    titleElement.textContent = modalData.title || 'Movie details';
  }
  bodyElement.innerHTML = renderMovieDetails(modalData);
}

export function showStatusMessage(element, message, alertClass) {
  element.className = 'alert ' + alertClass;
  element.textContent = message;
  element.classList.remove('d-none');
}

function buildMovieCardData(movie) {
  const savedRecord =
    getSavedMovie(movie.id) ||
    (movie.imdb_id ? getSavedMovieByImdb(movie.imdb_id) : null);
  return {
    id: savedRecord?.movie?.id || movie.id,
    title: movie.title || 'No title',
    poster_url: movie.poster_url || movie.poster || null,
    descriptionText: movie.description || 'No description.',
    detailsLine: buildDetailsLine(movie),
    badgeText: extractPrimaryRating(movie),
    runtimeText: movie.runtime
      ? 'Runtime: ' + movie.runtime
      : 'Runtime unknown',
    saved: Boolean(savedRecord),
    saved_movie_id: savedRecord?.id || null,
    imdb_id: movie.imdb_id || savedRecord?.movie?.imdb_id || null,
    canSave: Boolean(getAuthToken()),
  };
}

export function enhanceMovieCard(column) {
  const detailButton = column.querySelector('[data-action="detail"]');
  if (detailButton) {
    detailButton.addEventListener('click', () => {
      const movieId = detailButton.getAttribute('data-movie-id');
      if (!movieId) return;
      const detailEvent = new CustomEvent('movie:show-details', {
        detail: { movieId },
      });
      document.dispatchEvent(detailEvent);
    });
    detailButton.setAttribute('data-action-bound', 'true');
  }

  const watchlistButton = column.querySelector('[data-action="watchlist"]');
  if (watchlistButton) {
    watchlistButton.addEventListener('click', () => {
      const movieId = watchlistButton.getAttribute('data-movie-id');
      const imdbId = watchlistButton.getAttribute('data-imdb-id');
      if (!movieId && !imdbId) return;
      const watchlistAction = watchlistButton.getAttribute(
        'data-watchlist-action'
      );
      if (watchlistAction === 'add') {
        if (imdbId) {
          addMovieToWatchlistByImdb(imdbId);
        } else if (movieId) {
          addMovieToWatchlist(movieId);
        }
      } else if (watchlistAction === 'remove') {
        const savedMovieId = watchlistButton.getAttribute(
          'data-saved-movie-id'
        );
        if (savedMovieId) {
          removeMovieFromWatchlist(savedMovieId);
        } else {
          removeMovieFromWatchlistByMovieId(movieId);
        }
      }
    });
    watchlistButton.setAttribute('data-action-bound', 'true');
  }
}

function buildMovieDetailsData(movie, reviews) {
  return {
    ...movie,
    title: movie.title || 'Movie details',
    descriptionText: movie.description || 'No description yet.',
    detailsLine: buildDetailsLine(movie),
    ratings: Array.isArray(movie.ratings) ? movie.ratings : [],
    reviews: (reviews || []).map((review) => ({
      title: review.title || 'Review',
      comment: review.comment || 'No comment.',
      ratingText:
        typeof review.rating === 'number' ? `${review.rating} / 5` : 'N/A',
      reviewer:
        review.user && review.user.email ? review.user.email : 'Anonymous',
    })),
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
