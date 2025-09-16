class API {
  constructor() {
    this.USE_MOCK_DATA = true;
    this.initLocalStorage();
  }

  initLocalStorage() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(MOCK_DATA.users));
    }
    if (!localStorage.getItem('movies')) {
      localStorage.setItem('movies', JSON.stringify(MOCK_DATA.movies));
    }
  }

  // SEARCH functions
  async searchMovies(query) {
    const movies = JSON.parse(localStorage.getItem('movies'));
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.genre.toLowerCase().includes(query.toLowerCase())
    );
  }

  // CREATE functions
  async addToWatchList(userId, movieId) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find((user) => user.id === userId);

    if (!user.watchList.includes(movieId)) {
      user.watchList.push(movieId);
      localStorage.setItem('users', JSON.stringify(users));
    }
    return true;
  }

  async addRating(userId, movieId, rating, comment) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find((user) => user.id === userId);

    user.ratings.push({
      movieId,
      rating,
      comment,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  // READ functions
  async getAllMovies(limit = null) {
    const movies = JSON.parse(localStorage.getItem('movies'));
    return limit ? movies.slice(0, limit) : movies;
  }

  async getMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies'));
    return movies.find((movie) => movie.id === movieId);
  }

  async getUserWatchList(userId) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find((user) => user.id === userId);
    const movies = JSON.parse(localStorage.getItem('movies'));
    return user.watchList.map((id) => movies.find((movie) => movie.id === id));
  }

  // UPDATE functions
  async updateRating(userId, movieId, newRating, newComment) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find((user) => user.id === userId);
    const rating = user.ratings.find((rating) => rating.movieId === movieId);

    if (rating) {
      rating.rating = newRating;
      rating.comment = newComment;
      rating.timestamp = new Date().toISOString();
      localStorage.setItem('users', JSON.stringify(users));
    }
    return true;
  }

  // DELETE functions
  async removeFromWatchList(userId, movieId) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find((user) => user.id === userId);
    user.watchList = user.watchList.filter((id) => id !== movieId);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  async deleteRating(userId, movieId) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find((user) => user.id === userId);
    user.ratings = user.ratings.filter((rating) => rating.movieId !== movieId);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }
}

const api = new API();
