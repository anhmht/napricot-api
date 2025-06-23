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
      console.log('CORS Origin check:', origin)
      // Allow requests with no origin (like mobile apps, Postman, server-to-server)
      if (!origin) {
        callback(null, true)
        return
      }

      // Check if origin is in whitelist
      if (config.whitelist.includes(origin)) {
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
