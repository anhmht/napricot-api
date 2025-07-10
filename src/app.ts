import express, { Application } from 'express'
import fileUpload from 'express-fileupload'
import boolParser from 'express-query-boolean'
import cookieParser from 'cookie-parser'

// Import configuration modules
import connectToDropbox from './config/cloud'
import { configureRoutes } from './config/routes'
import { errorHandler } from './utils/errors'
import { configureCors } from './middlewares/cors'
import logger from './utils/logger'

/**
 * Initialize and configure the Express application
 */
function setupApp(): Application {
  const app = express()

  // Connect to Dropbox
  connectToDropbox().then((accessToken) => {
    if (accessToken) {
      app.locals.dropboxAccessToken = accessToken
    }
  })

  // Apply CORS BEFORE other middleware
  app.use(configureCors())

  // Apply cookie parser middleware
  app.use(cookieParser())

  // Conditionally apply file upload middleware only for multipart/form-data requests
  app.use((req, res, next) => {
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      return fileUpload({
        limits: {
          fileSize: 10000000 // Around 10MB
        },
        useTempFiles: true,
        tempFileDir: '/tmp/', // Specify temp directory
        createParentPath: true, // Create parent directories if they don't exist
        parseNested: true, // Parse nested objects in req.body
        debug: process.env.NODE_ENV === 'development' // Enable debug in development
      } as fileUpload.Options)(req, res, next)
    }
    next()
  })

  // Apply JSON parsing middleware for non-multipart requests
  app.use((req, res, next) => {
    if (!req.headers['content-type']?.startsWith('multipart/form-data')) {
      return express.json()(req, res, next)
    }
    next()
  })

  app.use(boolParser())

  // Configure all routes
  configureRoutes(app)

  // Error handler - must be after all routes and other middleware
  app.use(errorHandler)

  logger.info('Express application configured successfully')
  return app
}

// Create and export the configured Express application
const app = setupApp()
export default app
