import Router from 'koa-router' // 引入koa-router
import MessageController from '../../controller/user/messageController.js'

const router = new Router({ prefix: '/message' }) // 创建路由，支持传递参数

//获取消息列表
router.get('/list', MessageController.getMessageList)
//获取消息列表
router.post('/list', MessageController.updateMessageCount)
//删除消息列表
router.delete('/list', MessageController.deleteMessage)
//GPT
// router.post('/sendMsg', MessageController.chat)

export default router
