require('dotenv').config()

const connectDB = require('./config/db')
const connectToDropbox = require('./config/cloud')
const connectPM2AndReload = require('./pm2/script')

const express = require('express')
const fileUpload = require('express-fileupload')
const errorHandler = require('./middlewares/error')
const cors = require('cors')
const boolParser = require('express-query-boolean')

const userRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')
const imageRoutes = require('./routes/image')
const categoryRoutes = require('./routes/category')
const emailRoutes = require('./routes/email')
const checkoutRoutes = require('./routes/checkout')
const stripeRoutes = require('./routes/stripe')
const postRoutes = require('./routes/post')
const productRoutes = require('./routes/product')
const slackRoutes = require('./routes/slack')
const linkRoutes = require('./routes/link')
const configRoutes = require('./routes/config')
const contactRoutes = require('./routes/contact')

// const https = require('https')
// const fs = require('fs')
// const privateKey = fs.readFileSync('.ssl/server.key', 'utf8')
// const certificate = fs.readFileSync('.ssl/server.crt', 'utf8')
// const credentials = { key: privateKey, cert: certificate }

// Connect to DB
connectDB()

//PM2
connectPM2AndReload()

// Express App
const app = express()
const port = process.env.PORT || 8080

// Stripe Webhook use raw body
app.use('/stripe', stripeRoutes)

// Middleware
app.use(express.json())

// Connect to Dropbox
connectToDropbox().then((accessToken) => {
  app.locals.dropboxAccessToken = accessToken
})

const whitelist = process.env.WHITELIST_DOMAIN.split(',')
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))

// Use the express-fileupload middleware
app.use(
  fileUpload({
    limits: {
      fileSize: 10000000, // Around 10MB,
      useTempFiles: true
    }
  })
)
app.use(boolParser())
app.use(errorHandler)

// Routes
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

app.use('/', (req, res) => {
  return res.json({
    message: 'Welcome to the Napricot API'
  })
})

const server = app.listen(port, () => {
  console.log(`Server started listening on ${port}`)
  process.send('ready')
})

// const server = https.createServer(credentials, app)
// server.listen(port, () => {
//   console.log(`Server started listening on ${port}`)
//   process.send('ready')
// })

process.on('unhandledRejection', (error) => {
  console.log(`Logged Error: ${error}`)
  server.close(() => process.exit(1))
})

process.on('SIGINT', function () {
  console.log('Caught interrupt signal')
})
