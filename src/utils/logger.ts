/**
 * Logger utility for consistent logging throughout the application
 * Replaces direct console.log calls for better control in production environments
 */

// Environment-aware logger
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  info: (message: string, ...args: any[]): void => {
    if (isDevelopment || process.env.LOG_LEVEL === 'info') {
      console.info(`[INFO] ${message}`, ...args)
    }
  },

  error: (message: string, error?: any): void => {
    console.error(`[ERROR] ${message}`, error)
  },

  debug: (message: string, ...args: any[]): void => {
    if (isDevelopment || process.env.LOG_LEVEL === 'debug') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },

  warn: (message: string, ...args: any[]): void => {
    console.warn(`[WARN] ${message}`, ...args)
  }
}

export default logger
