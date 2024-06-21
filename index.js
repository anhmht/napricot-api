require('dotenv').config()

// const https = require('https')
// const fs = require('fs')

// const privateKey = fs.readFileSync('.ssl/server.key', 'utf8')
// const certificate = fs.readFileSync('.ssl/server.crt', 'utf8')

const credentials = { key: privateKey, cert: certificate }

const connectDB = require('./config/db')
const express = require('express')
const errorHandler = require('./middlewares/error')
const userRoutes = require('./routes/users')

// Connect to DB
connectDB()

// Express App
const app = express()
const port = process.env.PORT || 8080

app.use(express.json())

app.use(errorHandler)

// Routes
app.use('/users', userRoutes)

app.use('/', (req, res) => {
  return res.json({
    message: 'Welcome to the Node.js REST API using ExpressJS and MongoDB'
  })
})

const server = app.listen(port, () =>
  console.log(`Server started listening on ${port}`)
)

// const server = https.createServer(credentials, app)

server.listen(port, () => {
  console.log(`Server started listening on ${port}`)
})

process.on('unhandledRejection', (error, promise) => {
  console.log(`Logged Error: ${error}`)
  server.close(() => process.exit(1))
})
