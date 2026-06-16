require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { initSocket } = require('./socket')

const authRoutes = require('./routes/auth')
const postRoutes = require('./routes/posts')
const userRoutes = require('./routes/users')
const notificationRoutes = require('./routes/notifications')

const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 3000

// Initialize Socket.io
initSocket(server)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err))

app.get('/', (req, res) => {
  res.send('WRLD OF ZYIONNE server is running!')
})

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})