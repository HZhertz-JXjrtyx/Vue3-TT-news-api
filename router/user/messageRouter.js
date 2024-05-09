import Router from 'koa-router' // 引入koa-router
import MessageController from '../../controller/user/messageController.js'

const router = new Router({ prefix: '/message' })

//获取用户通知列表
router.get('/notify/list', MessageController.getNotifyList)
//获取通知消息内容
router.get('/notify/detail', MessageController.getNotifyDetail)
//获取用户对话列表
router.get('/chat/list', MessageController.getChatList)
//获取对话消息内容
router.get('/chat/detail', MessageController.getChatDetail)

// //获取消息列表
// router.get('/list', MessageController.getMessageList)
// //获取消息列表
// router.post('/list', MessageController.updateMessageCount)
// //删除消息列表

export default router
