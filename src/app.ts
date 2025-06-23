import express, { Application } from 'express'
import fileUpload from 'express-fileupload'
import boolParser from 'express-query-boolean'

// Import our TypeScript routes
import {
  authRoutes,
  userRoutes,
  imageRoutes,
  categoryRoutes,
  postRoutes,
  productRoutes,
  stripeRoutes,
  linkRoutes,
  contactRoutes,
  configRoutes,
  slackRoutes,
  checkoutRoutes,
  emailRoutes,
  urlPreviewRoutes
} from './routes'

// Import modules
import connectToDropbox from './config/cloud'
import { errorHandler } from './utils/errors'
import { configureCors } from './middlewares/cors'
import logger from './utils/logger'

/**
 * Initialize and configure the Express application
 */
function setupApp(): Application {
  const app = express()

  // Enable trust proxy for Heroku/production environments
  app.set('trust proxy', 1)

  // Stripe Webhook use raw body
  app.use('/stripe', stripeRoutes)

  // Connect to Dropbox
  connectToDropbox().then((accessToken) => {
    if (accessToken) {
      app.locals.dropboxAccessToken = accessToken
    }
  })

  // Debug middleware to log headers BEFORE CORS
  app.use((req, res, next) => {
    console.log('=== REQUEST DEBUG ===')
    console.log('Method:', req.method)
    console.log('URL:', req.url)
    console.log('Origin header:', req.headers.origin)
    console.log('Referer header:', req.headers.referer)
    console.log('User-Agent:', req.headers['user-agent'])
    console.log('All headers:', JSON.stringify(req.headers, null, 2))
    console.log('=== END DEBUG ===')
    next()
  })

  // Apply CORS BEFORE other middleware
  app.use(configureCors())

  // Apply other middleware
  app.use(express.json())
  // Use the express-fileupload middleware
  app.use(
    fileUpload({
      limits: {
        fileSize: 10000000 // Around 10MB
      },
      useTempFiles: true
    } as fileUpload.Options)
  )
  app.use(boolParser())

  // Routes - all are now using TypeScript versions
  app.use('/users', userRoutes)
  app.use('/images', imageRoutes)
  app.use('/', authRoutes)
  app.use('/categories', categoryRoutes)
  app.use('/email', emailRoutes)
  app.use('/checkout', checkoutRoutes)
  app.use('/post', postRoutes)
  app.use('/product', productRoutes)
  app.use('/slack', slackRoutes)
  app.use('/link', linkRoutes)
  app.use('/config', configRoutes)
  app.use('/contact', contactRoutes)
  app.use('/', urlPreviewRoutes)

  // Register routes
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to the Napricot Operations API'
    })
  })

  // Error handler - must be after all routes and other middleware
  app.use(errorHandler)

  logger.info('Express application configured successfully')
  return app
}

// Create and export the configured Express application
const app = setupApp()
export default app
