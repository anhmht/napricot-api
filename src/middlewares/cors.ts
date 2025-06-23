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
      // Allow requests with no origin (like mobile apps, Postman, server-to-server)
      if (!origin) {
        console.log('CORS: No origin provided, allowing request')
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
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-Access-Token'
    ],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  }

  return cors(corsOptions)
}
