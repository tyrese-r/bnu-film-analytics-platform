import { describeConfig } from './config.js';
import { logInfo } from './logger.js';
import { loadMovieFeed } from './movies.js';
import { initialiseAuthUI, verifySession } from './auth/ui.js';
import { loadWatchlist } from './watchlist/manager.js';
import { initialiseSearch } from './search/ui.js';

export function startApp() {
  logInfo('Frontend scaffold initialised.');
  logInfo(describeConfig());
  initialiseAuthUI();
  verifySession();
  loadWatchlist();
  loadMovieFeed();
  initialiseSearch();
}
