/**
 * Server Factory
 * Creates the appropriate server (HTTP or HTTPS) based on environment
 */
import http from 'http'
import https from 'https'
import express from 'express'
import { config } from '../config/env'
import { SSLCredentials } from '../utils/ssl'

/**
 * Creates either an HTTP or HTTPS server based on environment and available credentials
 * @param app Express application
 * @param sslCredentials SSL credentials (if available)
 * @returns HTTP or HTTPS server
 */
export function createServer(
  app: express.Application,
  sslCredentials: SSLCredentials | null
): http.Server {
  // Use HTTPS server in development with valid credentials
  if (!config.isProduction && sslCredentials) {
    const server = https.createServer(sslCredentials, app)

    return server
  }

  // Otherwise use HTTP server (for production or if SSL certs are missing)
  return http.createServer(app)
}

/**
 * Starts the server on the configured port
 * @param server HTTP or HTTPS server
 * @returns The server instance
 */
export function startServer(server: http.Server): http.Server {
  server.listen(config.port, () => {
    const protocol = server instanceof https.Server ? 'HTTPS' : 'HTTP'
    console.log(
      `Server started listening on ${config.port} in ${config.nodeEnv} mode (${protocol})`
    )

    // Signal to PM2 that server is ready
    if (process.send) {
      process.send('ready')
    }
  })

  return server
}
