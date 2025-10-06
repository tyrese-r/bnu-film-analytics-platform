// logger wrapper to avoid repetition
export function logInfo(message, ...rest) {
  console.log(`[BNU Film] ${message}`, ...rest);
}

export function logWarning(message, ...rest) {
  console.warn(`[BNU Film] ${message}`, ...rest);
}

export function logError(message, ...rest) {
  console.error(`[BNU Film] ${message}`, ...rest);
}
