import { config } from 'dotenv'
config()
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Cors from 'koa2-cors'
import Static from 'koa-static'
import range from 'koa-range'
// import { Server } from 'socket.io'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import checkToken from './middleware/checkToken.js'
import WebSocketServer from './utils/WebSocketServer.js'

import userRouter from './router/user/userRouter.js'
import channelRouter from './router/user/channelRouter.js'
import newsRouter from './router/user/newsRouter.js'
import articleRouter from './router/user/articleRouter.js'
import videoRouter from './router/user/videoRouter.js'
import commentRouter from './router/user/commentRouter.js'
import searchRouter from './router/user/searchRouter.js'
import messageRouter from './router/user/messageRouter.js'

const app = new Koa()

const server = http.createServer(app.callback())
// 创建 WebSocketServer 实例
const webSocketServer = new WebSocketServer()
// 初始化 WebSocket 服务器
webSocketServer.initialize(server)
// const io = new Server(server)
// // 保存所有连接的对象
// const users = {}

// // 建立连接
// io.on('connection', (socket) => {
//   const userId = socket.handshake.query.userId
//   console.log(userId)
//   users[userId] = socket

//   console.log('a user connected: ' + userId)
//   // sendBySocketToUser('chat', userId, { message: 'user connected' })

//   // 断开连接
//   socket.on('disconnect', () => {
//     console.log('user disconnected: ' + userId)
//     delete users[userId]
//   })
//   // 接收消息
//   socket.on('chat message', (data) => {
//     const { senderId, receiverId, msg } = data
//     // 处理
//   })
// })

// // 向所有客户端广播消息 未使用
// export function sendBySocketToAll(msg) {
//   io.emit('system message', msg)
// }

// // 向特定的用户发送消息
// // msgType: chat-新增对话 chat message-新增对话消息
// export function sendBySocketToUser(msgType, receiverId, msg) {
//   if (users[receiverId]) {
//     users[receiverId].emit(msgType, msg)
//   }
// }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(Cors())
app.use(bodyParser())
app.use(checkToken)
app.use(range)
app.use(Static(path.join(__dirname, './public')))

app.use(userRouter.routes())
app.use(channelRouter.routes())
app.use(newsRouter.routes())
app.use(articleRouter.routes())
app.use(videoRouter.routes())
app.use(commentRouter.routes())
app.use(searchRouter.routes())
app.use(messageRouter.routes())

//监听端口
server.listen(3007, () => {
  console.log('server runing at http://127.0.0.1:3007')
})
