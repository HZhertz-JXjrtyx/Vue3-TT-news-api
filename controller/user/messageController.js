import MessageModel from '../../model/user/messageModel.js'
class MessageController {
  // 获取用户通知列表
  async getNotifyList(ctx) {
    const { _id: userId } = ctx.state.user
    console.log(userId)
    const [commentRes, likeRes, followRes] = await Promise.all([
      MessageModel.getNotificationList(userId, 'comment'),
      MessageModel.getNotificationList(userId, 'like'),
      MessageModel.getNotificationList(userId, 'follow'),
    ])
    ctx.body = {
      type: 'success',
      status: 200,
      message: '获取用户通知列表成功',
      data: {
        comment: {
          last_message: commentRes.latestNotification,
          unReadCount: commentRes.unReadCount,
        },
        like: {
          last_message: likeRes.latestNotification,
          unReadCount: likeRes.unReadCount,
        },
        follow: {
          last_message: followRes.latestNotification,
          unReadCount: followRes.unReadCount,
        },
      },
    }
  }
  // 获取通知消息内容
  async getNotifyDetail(ctx) {
    const { _id: userId } = ctx.state.user
    const { type, page, size } = ctx.request.query
    console.log(userId, type, page, size)
    const offset = (page - 1) * size
    const data = await MessageModel.getNotificationDetail(userId, type, offset, parseInt(size))
    ctx.body = {
      type: 'success',
      status: 200,
      message: `获取${type}通知消息成功`,
      data,
    }
  }
  // 获取用户对话列表
  async getChatList(ctx) {
    const { _id: userId } = ctx.state.user
    console.log(userId)
    const data = await MessageModel.getConversationList(userId)
    ctx.body = {
      type: 'success',
      status: 200,
      message: ' 获取用户对话列表成功',
      data,
    }
  }
  // 获取对话消息内容
  async getChatDetail(ctx) {
    const { _id: userId } = ctx.state.user
    const { conversationId } = ctx.request.query
    console.log(userId, conversationId)
    const data = await MessageModel.getConversationDetail(userId, conversationId)
    ctx.body = {
      type: 'success',
      status: 200,
      message: '获取对话消息内容成功',
      data,
    }
  }
  async addChatMessage(ctx) {
    const { userId, receiverId, conversationId, content, createdAt } = ctx.request.query
  }
}
export default new MessageController()
