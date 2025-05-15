/**
 * SSL Certificate Utility
 * Handles loading SSL certificates for HTTPS server
 */
import fs from 'fs'
import path from 'path'
import { config } from '../config/env'

export interface SSLCredentials {
  key: string
  cert: string
}

// Determine the project root directory more reliably
const PROJECT_ROOT = path.resolve(__dirname, '../..')

/**
 * Loads SSL certificates if in development mode
 * @returns SSL credentials object or null if certificates can't be loaded
 */
export function loadSSLCredentials(): SSLCredentials | null {
  // Don't load SSL in production as Render handles SSL termination
  if (config.isProduction) {
    return null
  }

  // Log the paths we're going to use for debugging
  const keyPath = path.join(PROJECT_ROOT, '.ssl/server.key')
  const certPath = path.join(PROJECT_ROOT, '.ssl/server.crt')
  console.log('Looking for SSL certificates at:')
  console.log(`Key: ${keyPath}`)
  console.log(`Certificate: ${certPath}`)

  try {
    // Use absolute paths based on the project root
    const privateKey = fs.readFileSync(keyPath, 'utf8')
    const certificate = fs.readFileSync(certPath, 'utf8')

    console.log('SSL certificates loaded successfully for development')
    return { key: privateKey, cert: certificate }
  } catch (error) {
    console.error('Error loading SSL certificates:', error)
    console.log('Will fall back to HTTP server')
    return null
  }
}
