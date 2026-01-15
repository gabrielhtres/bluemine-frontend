/**
 * Sistema de logging condicional
 * Só loga em desenvolvimento ou quando explicitamente habilitado
 */
const isDevelopment = import.meta.env.DEV;
const isLoggingEnabled = import.meta.env.VITE_ENABLE_LOGGING === "true" || isDevelopment;

export const logger = {
  error: (...args) => {
    if (isLoggingEnabled) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (isLoggingEnabled) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (isLoggingEnabled) {
      console.info(...args);
    }
  },
  log: (...args) => {
    if (isLoggingEnabled) {
      console.log(...args);
    }
  },
};
