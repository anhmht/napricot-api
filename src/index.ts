import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
import https from 'https'

// Import the configured Express application
import app from './app'
import connectDB from './config/db'
import connectPM2AndReload from './pm2/script'
import { createServer, startServer } from './server/server'
import { loadSSLCredentials } from './utils/ssl'
import logger from './utils/logger'

/**
 * Main application initialization function
 */
function initialize(): void {
  try {
    // Connect to MongoDB
    connectDB()

    // Connect PM2 for monitoring
    connectPM2AndReload()

    // Load SSL certificates (only in development)
    const sslCredentials = loadSSLCredentials()

    // Create and start the server
    const server = createServer(app, sslCredentials)
    startServer(server)

    // Set up error handling
    setupErrorHandling(server)
  } catch (error) {
    logger.error('Failed to initialize application:', error)
    process.exit(1)
  }
}

/**
 * Configure process-level error handling
 */
function setupErrorHandling(server: http.Server | https.Server): void {
  process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error)
    server.close(() => process.exit(1))
  })

  process.on('SIGINT', () => {
    logger.info('Caught interrupt signal')
    server.close(() => process.exit(0))
  })
}

// Start the application
initialize()
