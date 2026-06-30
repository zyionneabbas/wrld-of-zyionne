import { io } from 'socket.io-client'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

let socket = null

export const connectSocket = (userId) => {
  if (socket?.connected) return socket

  socket = io(API, {
    transports: ['polling', 'websocket']
  })

  socket.on('connect', () => {
    socket.emit('joinRoom', userId)
    socket.emit('userOnline', userId)
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}