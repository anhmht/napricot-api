/**
 * CORS Configuration
 * Sets up the CORS middleware for the application
 */
import cors from 'cors'
import { config } from '../config/env'

/**
 * Configures and returns the CORS middleware
 */
export function configureCors() {
  const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback) => {
      if (config.whitelist.indexOf(origin ?? '') !== -1 || !origin) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }

  return cors(corsOptions)
}
