// central location for configs/constants
export const API_BASE_URL =
  window.__API_BASE_URL__ || 'http://localhost:3001/api/v1';

// log config to console
export function describeConfig() {
  return `API base: ${API_BASE_URL}`;
}
