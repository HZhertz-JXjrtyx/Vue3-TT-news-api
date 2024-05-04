import { config } from 'dotenv'
config()
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Cors from 'koa2-cors'
import Static from 'koa-static'
import range from 'koa-range'
import { Server } from 'socket.io'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import checkToken from './middleware/checkToken.js'

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
const io = new Server(server)

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

// import News from './schema/db/news.js'
// import CheckCount from './schema/db/check_count.js'
// import MessageController from './controller/user/messageController.js'
// import MessageModel from './model/user/messageModel.js'
// import sendEmail from './utils/sendEmail.js'
// import User from './schema/db/users.js'
// io.on('connection', (socket) => {
//   console.log('a user connected')
//   //接收到消息时触发
//   // socket.emit('hello', {
//   //   message: 'data'
//   // })
//   socket.on('check-for-updates', async (data) => {
//     console.log('data', data)
//     let userId = data.user_id
//     // 检查数据库是否有新数据
//     const result = await checkForNewData()
//     // console.log(result)
//     if (result) {
//       console.log('更新了' + result.length + '条新数据')
//       // 用户关注的作者是否有更新
//       const atData = await MessageController.chooseAtData(userId, result)
//       console.log('atData.length', atData.length)
//       if (atData.length !== 0) {
//         const maxTakeTimeItem = atData.reduce((maxItem, currentItem) =>
//           currentItem.take_time > maxItem.take_time ? currentItem : maxItem
//         )
//         const sendTime = Math.floor(Date.now() / 1000)
//         // 发送邮件
//         const user = await User.findOne({ user_id: userId })
//         const userEmail = user.user_email
//         const title = maxTakeTimeItem.title
//         const name = maxTakeTimeItem.author_info.name
//         const desc = maxTakeTimeItem.article_info.description
//         const href = maxTakeTimeItem.url
//         let info = await sendEmail(
//           userEmail,
//           '关注的消息',
//           title,
//           `<p>来自你的关注:${name}</p><h1>${title}</h1><p>${desc}</p><br/>
//         更多信息点击 ——> <a href="${href}">${href}</a>`
//         )
//         console.log(`Message sent: ${info.messageId}`)
//         // 保存到数据库消息列表
//         await MessageModel.updateAttMessage(userId, sendTime, atData)
//         // 向前端发送数据

//         socket.emit(`${userId}`, {
//           message: '关注的新消息',
//           sendTime: sendTime,
//           newdata: atData,
//         })
//       }
//       const data = await MessageController.chooseData(userId, result)
//       console.log(data.title)
//       // 如果有新数据，将推送消息
//       const sendTime = Math.floor(Date.now() / 1000)
//       // 发送邮件
//       const user = await User.findOne({ user_id: userId })
//       const userEmail = user.user_email
//       const title = data.title
//       const desc = data.article_info.description
//       const href = data.url
//       let info = await sendEmail(
//         userEmail,
//         '头条新闻',
//         title,
//         `<h1>${title}</h1><p>${desc}</p><br/>
//         更多信息点击 ——> <a href="${href}">${href}</a>`
//       )
//       console.log(`Message sent: ${info.messageId}`)
//       // 保存到数据库消息列表
//       await MessageModel.updateMessageList(userId, sendTime, data)
//       // 向前端发送数据

//       socket.emit(`new-data${userId}`, {
//         message: '最新数据',
//         sendTime: sendTime,
//         newdata: data,
//       })
//     }
//   })
// })
// async function checkForNewData() {
//   // 获取ALL_news集合的数据数量
//   const newsCount = await News.countDocuments()
//   // 获取check_count集合中name="ALL_news_count"的文档的count值
//   const checkCountDoc = await CheckCount.findOne({ name: 'ALL_news_count' })
//   const count = checkCountDoc ? checkCountDoc.count : 0
//   if (newsCount > count) {
//     // 如果newsCount大于count，则表明有新数据
//     // 更新check_count集合中name="ALL_news_count"的文档的count值
//     await CheckCount.updateOne({ name: 'ALL_news_count' }, { count: newsCount }, { upsert: true })
//     // 获取ALL_news集合的所有文档，按照文档的take_time降序排序取前newsCount-count条数据
//     const newData = await News.find()
//       .sort({ take_time: -1 })
//       .limit(newsCount - count)
//     return newData
//   } else {
//     // 更新check_count集合中name="ALL_news_count"的文档的count值
//     await CheckCount.updateOne({ name: 'ALL_news_count' }, { count: newsCount }, { upsert: true })
//     // 没有新数据
//     return null
//   }
// }
//监听端口
server.listen(3007, () => {
  console.log('server runing at http://127.0.0.1:3007')
})
