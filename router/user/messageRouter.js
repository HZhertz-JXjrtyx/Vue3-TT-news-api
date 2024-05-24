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
// 是否已有对话
router.get('/chat/ishas', MessageController.isHasChat)
// 新增对话
router.post('/chat/add', MessageController.addChat)
// 发送对话消息
router.post('/chat/send', MessageController.addChatMessage)
// 获取未读消息总数
router.get('/unread/total', MessageController.getUnreadTotalCount)
// 清除未读
router.patch('/clear/unread', MessageController.clearUnreadMessage)
// router.post('/list', MessageController.updateMessageCount)
// //删除消息列表

export default router
