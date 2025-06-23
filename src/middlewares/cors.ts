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
  // Log the whitelist for debugging
  console.log('CORS Whitelist:', config.whitelist)

  const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback) => {
      console.log('CORS Origin check:', origin, 'Whitelist:', config.whitelist)

      if (config.whitelist.indexOf(origin ?? '') !== -1 || !origin) {
        console.log('CORS: Origin allowed')
        callback(null, true)
      } else {
        console.log('CORS: Origin blocked')
        callback(new Error('Not allowed by CORS'))
      }
    }
  }

  return cors(corsOptions)
}
