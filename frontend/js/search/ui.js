// handles search form interactions and result rendering
import { getAuthToken } from '../auth/state.js';
import { renderMovieCard } from '../movies/templates.js';
import { enhanceMovieCard } from '../movies/ui.js';
import { getSavedMovieByImdb } from '../watchlist/manager.js';
import { searchMovies } from './api.js';

const searchForm = document.getElementById('searchForm');
const searchQueryInput = document.getElementById('searchQuery');
const searchStatusElement = document.getElementById('searchStatus');
const searchResultsGrid = document.getElementById('searchResults');

let latestResults = [];

export function initialiseSearch() {
  if (!searchForm) return;
  searchForm.addEventListener('submit', handleSearchSubmit);
  document.addEventListener('watchlist:updated', () => {
    if (latestResults.length) {
      setResults(latestResults);
    }
  });
}

async function handleSearchSubmit(event) {
  event.preventDefault();
  if (!searchForm || !searchQueryInput) return;

  if (!searchForm.checkValidity()) {
    searchForm.classList.add('was-validated');
    return;
  }

  const query = searchQueryInput.value.trim();
  if (!query) {
    showStatus('Please enter a movie title.', 'alert-warning');
    return;
  }

  try {
    showStatus('Searching OMDb...', 'alert-secondary');
    setResults([]);
    const movies = await searchMovies(query);
    if (movies.length === 0) {
      showStatus('No matches found. Try a different title.', 'alert-warning');
      return;
    }
    showStatus(`Found ${movies.length} movie(s).`, 'alert-success');
    setResults(movies);
  } catch (error) {
    showStatus(
      error.message || 'Search failed. Try again later.',
      'alert-danger'
    );
  }
}

function setResults(movies) {
  if (!searchResultsGrid) return;
  latestResults = movies;
  searchResultsGrid.innerHTML = '';
  movies.forEach((movie) => {
    const column = document.createElement('div');
    column.className = 'col';
    column.innerHTML = renderMovieCard(mapOmdbMovieToCard(movie));
    enhanceMovieCard(column);
    searchResultsGrid.appendChild(column);
  });
}

function showStatus(message, alertClass) {
  if (!searchStatusElement) return;
  searchStatusElement.textContent = message;
  searchStatusElement.className = 'alert ' + alertClass;
  searchStatusElement.classList.remove('d-none');
}

function mapOmdbMovieToCard(movie) {
  const savedRecord = getSavedMovieByImdb(movie.imdb_id);
  return {
    id: savedRecord?.movie?.id || '',
    imdb_id: movie.imdb_id,
    title: movie.title,
    poster_url: movie.poster,
    descriptionText: movie.description || 'No description yet.',
    detailsLine: buildDetailsLine(movie),
    badgeText: extractPrimaryRating(movie),
    runtimeText: movie.runtime
      ? 'Runtime: ' + movie.runtime
      : 'Runtime unknown',
    saved: Boolean(savedRecord),
    saved_movie_id: savedRecord?.id || null,
    canSave: Boolean(getAuthToken()),
  };
}

function buildDetailsLine(movie) {
  const parts = [];
  if (movie.release_date) parts.push(movie.release_date);
  if (movie.genre) parts.push(movie.genre);
  if (movie.director) parts.push('Dir. ' + movie.director);
  return parts.length ? parts.join(' • ') : 'Details unavailable.';
}

function extractPrimaryRating(movie) {
  if (!Array.isArray(movie.ratings) || movie.ratings.length === 0) {
    return null;
  }
  const rating = movie.ratings[0];
  const source = rating.source || 'Score';
  const value = rating.value || 'N/A';
  return `${source}: ${value}`;
}
