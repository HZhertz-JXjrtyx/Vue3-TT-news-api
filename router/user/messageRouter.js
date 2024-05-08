import Router from 'koa-router' // 引入koa-router
import MessageController from '../../controller/user/messageController.js'

const router = new Router({ prefix: '/message' })

//获取对话消息列表
router.get('/chat/list', MessageController.getChatList)
//获取通知消息列表
router.get('/notify/list', MessageController.getNotifyList) 

// //获取消息列表
// router.get('/list', MessageController.getMessageList)
// //获取消息列表
// router.post('/list', MessageController.updateMessageCount)
// //删除消息列表
// router.delete('/list', MessageController.deleteMessage)
//GPT
// router.post('/sendMsg', MessageController.chat)

export default router
