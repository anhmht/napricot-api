require('dotenv').config()

const connectDB = require('./config/db')
const connectToDropbox = require('./config/cloud')

const express = require('express')
const fileUpload = require('express-fileupload')
const errorHandler = require('./middlewares/error')
const cors = require('cors')
const boolParser = require('express-query-boolean')

const userRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')
const uploadRoutes = require('./routes/upload')
const categoryRoutes = require('./routes/category')
const emailRoutes = require('./routes/email')

// const https = require('https')
// const fs = require('fs')
// const privateKey = fs.readFileSync('.ssl/server.key', 'utf8')
// const certificate = fs.readFileSync('.ssl/server.crt', 'utf8')
// const credentials = { key: privateKey, cert: certificate }

// Connect to DB
connectDB()

// Express App
const app = express()
const port = process.env.PORT || 8080
app.use(express.json())

// Connect to Dropbox
connectToDropbox().then((accessToken) => {
  app.locals.dropboxAccessToken = accessToken
})

var whitelist = process.env.WHITELIST_DOMAIN.split(',')
var corsOptions = {
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
app.use('/images', uploadRoutes)
app.use('/', authRoutes)
app.use('/categories', categoryRoutes)
app.use('/email', emailRoutes)

app.use('/', (req, res) => {
  return res.json({
    message: 'Welcome to the Napricot API'
  })
})

const server = app.listen(port, () =>
  console.log(`Server started listening on ${port}`)
)

// const server = https.createServer(credentials, app)
// server.listen(port, () => {
//   console.log(`Server started listening on ${port}`)
// })

process.on('unhandledRejection', (error, promise) => {
  console.log(`Logged Error: ${error}`)
  server.close(() => process.exit(1))
})
