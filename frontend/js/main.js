// entry point: wait for the DOM then start app
import { startApp } from './app.js';
import { logWarning } from './logger.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  try {
    startApp();
  } catch (error) {
    logWarning('Failed to start application', error);
  }
}
