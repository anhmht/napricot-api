import { Application } from 'express'

// Import each route directly
import userRoutes from '../routes/users'
import imageRoutes from '../routes/image'
import categoryRoutes from '../routes/category'
import postRoutes from '../routes/post'
// import productRoutes from '../routes/product'
import stripeRoutes from '../routes/stripe'
import linkRoutes from '../routes/link'
import contactRoutes from '../routes/contact'
import checkoutRoutes from '../routes/checkout'
import emailRoutes from '../routes/email'
import urlPreviewRoutes from '../routes/urlPreview'

/**
 * Configure and mount all application routes
 */
export function configureRoutes(app: Application): void {
  // Stripe Webhook use raw body - this route needs to be mounted first
  app.use('/stripe', stripeRoutes)

  // Mount all other routes
  app.use('/users', userRoutes)
  app.use('/images', imageRoutes)
  app.use('/categories', categoryRoutes)
  app.use('/email', emailRoutes)
  app.use('/checkout', checkoutRoutes)
  app.use('/post', postRoutes)
  // app.use('/product', productRoutes)
  app.use('/link', linkRoutes)
  app.use('/contact', contactRoutes)
  app.use('/', urlPreviewRoutes)

  // Register root route
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to the Napricot Operations API'
    })
  })
}
