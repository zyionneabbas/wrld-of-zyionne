const socketIO = require('socket.io')

let io

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  // Store online users
  const onlineUsers = new Map()

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // User comes online
    socket.on('userOnline', (userId) => {
      onlineUsers.set(userId, socket.id)
      io.emit('onlineUsers', Array.from(onlineUsers.keys()))
    })

    // Join personal room for private notifications
    socket.on('joinRoom', (userId) => {
      socket.join(userId)
    })

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          onlineUsers.delete(userId)
        }
      })
      io.emit('onlineUsers', Array.from(onlineUsers.keys()))
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

module.exports = { initSocket, getIO }