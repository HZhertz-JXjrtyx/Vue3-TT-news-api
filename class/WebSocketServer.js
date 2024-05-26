import { Server } from 'socket.io'

class WebSocketServer {
  static instance = null
  static io = null
  static users = {}

  // 使用了单例模式确保只有一个 WebSocketServer 实例被创建，
  // 而 io 和 users 对象是 WebSocketServer 类的静态属性，因此它们在整个应用中都是共享的。
  constructor() {
    if (!WebSocketServer.instance) {
      WebSocketServer.instance = this
    }
    return WebSocketServer.instance
  }

  initialize(server) {
    if (!WebSocketServer.io) {
      WebSocketServer.io = new Server(server)

      WebSocketServer.io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId
        WebSocketServer.users[userId] = socket

        console.log('a user connected: ' + userId)
        // console.log(WebSocketServer.users.lenght)

        socket.on('disconnect', () => {
          console.log('user disconnected: ' + userId)
          delete WebSocketServer.users[userId]
        })

        // socket.on('chat message', (data) => {
        //   const { senderId, receiverId, msg } = data
        //   // 处理消息
        // })
      })
    }
  }

  sendBySocketToAll(msg) {
    if (WebSocketServer.io) {
      WebSocketServer.io.emit('system message', msg)
    }
  }

  sendBySocketToUser(msgType, receiverId, msg) {
    if (WebSocketServer.users[receiverId]) {
      WebSocketServer.users[receiverId].emit(msgType, msg)
    }
  }
}

export default WebSocketServer
