// This file must be imported FIRST before any other modules
import dotenv from 'dotenv'

// Configure environment variables
dotenv.config()

// Verify critical environment variables are loaded
if (!process.env.DROPBOX_REFRESH_TOKEN || !process.env.NODE_ENV) {
  console.error('DROPBOX_REFRESH_TOKEN is not defined in environment variables')
  process.exit(1)
}

console.log('Environment variables loaded successfully')
