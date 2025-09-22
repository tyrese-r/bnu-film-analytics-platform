/**
 * Mock Movie API for development.
 * -------------------------------
 * When backend is ready:
 *  - Replace localStorage calls with fetch()
 */

// Constants
const USER_NOT_FOUND_ERR = 'User not found';
const LS_KEYS = {
  USERS: 'users',
  MOVIES: 'movies',
};

class API {
  constructor() {
    this.USE_MOCK_DATA = true; // TODO: Implement logic to use this flag
    this.initLocalStorage();
  }

  // Init localStorage with mock data (/data/mockData.js)
  initLocalStorage() {
    if (!localStorage.getItem(LS_KEYS.USERS)) {
      localStorage.setItem(LS_KEYS.USERS, JSON.stringify(MOCK_DATA.users));
    }
    if (!localStorage.getItem(LS_KEYS.MOVIES)) {
      localStorage.setItem(LS_KEYS.MOVIES, JSON.stringify(MOCK_DATA.movies));
    }
  }

  // Helper Functions
  getUsers = () => JSON.parse(localStorage.getItem(LS_KEYS.USERS));
  getMovies = () => JSON.parse(localStorage.getItem(LS_KEYS.MOVIES));
  saveUsers(users) {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
  }

  // SEARCH functions
  async searchMovies(query) {
    const movies = this.getMovies();
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.genre.toLowerCase().includes(query.toLowerCase())
    );
  }

  // CREATE functions
  async addToWatchList(userId, movieId) {
    const users = this.getUsers();
    const user = users.find((user) => user.id === userId);

    if (!user) {
      throw new Error(USER_NOT_FOUND_ERR);
    }

    if (!user.watchList.includes(movieId)) {
      user.watchList.push(movieId);
      this.saveUsers(users);
    }
    return true;
  }

  async addRating(userId, movieId, rating, comment = '') {
    const users = this.getUsers();
    const user = users.find((user) => user.id === userId);

    if (!user) {
      throw new Error(USER_NOT_FOUND_ERR);
    }

    user.ratings.push({
      movieId,
      rating,
      comment,
      timestamp: new Date().toISOString(),
    });

    this.saveUsers(users);
    return true;
  }

  // READ functions
  async getAllMovies(limit = null) {
    const movies = this.getMovies();
    return limit ? movies.slice(0, limit) : movies;
  }

  async getMovie(movieId) {
    const movies = this.getMovies();
    return movies.find((movie) => movie.id === movieId);
  }

  async getUserWatchList(userId) {
    const users = this.getUsers();
    const movies = this.getMovies();
    const user = users.find((user) => user.id === userId);

    if (!user) {
      throw new Error(USER_NOT_FOUND_ERR);
    }

    return user.watchList.map((id) => movies.find((movie) => movie.id === id));
  }

  // UPDATE functions
  async updateRating(userId, movieId, newRating, newComment) {
    const users = this.getUsers();
    const user = users.find((user) => user.id === userId);

    if (!user) {
      throw new Error(USER_NOT_FOUND_ERR);
    }

    const rating = user.ratings.find((rating) => rating.movieId === movieId);

    if (rating) {
      rating.rating = newRating;
      rating.comment = newComment;
      rating.timestamp = new Date().toISOString();
      this.saveUsers(users);
    }
    return true;
  }

  // DELETE functions
  async removeFromWatchList(userId, movieId) {
    const users = this.getUsers();
    const user = users.find((user) => user.id === userId);

    if (!user) {
      throw new Error(USER_NOT_FOUND_ERR);
    }

    user.watchList = user.watchList.filter((id) => id !== movieId);
    this.saveUsers(users);
    return true;
  }

  async deleteRating(userId, movieId) {
    const users = this.getUsers();
    const user = users.find((user) => user.id === userId);

    if (!user) {
      throw new Error(USER_NOT_FOUND_ERR);
    }

    user.ratings = user.ratings.filter((rating) => rating.movieId !== movieId);
    this.saveUsers(users);
    return true;
  }
}

const api = new API();
